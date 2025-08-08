'use node';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, generateText, tool } from 'ai';
import { v } from 'convex/values';
import Exa from 'exa-js';
import { z } from 'zod';
import { AgentOutputSchema } from '../src/SlidesSchema';
import { api } from './_generated/api';
import { action } from './_generated/server';
import { PostHog } from 'posthog-node';
import { withTracing } from '@posthog/ai';

export const agent = action({
  args: {
    courseId: v.id('Course'),
  },
  handler: async (ctx, args): Promise<any> => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error('Not authenticated');

    const course = await ctx.runQuery(api.course.getCourse, {
      courseId: args.courseId,
    });

    console.log('Agent received message sucessfully from the backend', course);

    // Get API key from environment
    const openRouterKey = process.env.OPENROUTER_API_KEY || '';
    if (!openRouterKey) {
      throw new Error(
        'OpenRouter API key is required. Please add your API key in settings.'
      );
    }

    if (!openRouterKey.startsWith('sk-')) {
      throw new Error(
        "Invalid OpenRouter API key format. Key should start with 'sk-'"
      );
    }

    const phClient = new PostHog(process.env.POSTHOG_KEY!, {
      host: process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com',
    });

    // Create OpenRouter client
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openRouterKey,
    });

    const tracedModel = (modelName: string, ctx: { userId: string; courseId: string }) =>
      withTracing(openrouter(modelName), phClient, {
        posthogDistinctId: ctx.userId,
        posthogProperties: {
          course_id: ctx.courseId,
          source: 'sphereai-agent',
        },
        // Optional: redact inputs/outputs if needed
        // redactInput: true,
        // redactOutput: true,
      });
    const modelCtx = { userId: userId.subject, courseId: args.courseId };
    type ToolExec<TArgs, TResult> = (args: TArgs) => Promise<TResult>;
  // wrapper to track and log the tool usage
    function withToolTracing<TArgs extends Record<string, any>, TResult>(
      name: string,
      exec: ToolExec<TArgs, TResult>,
      ph: PostHog,
      baseProps?: Record<string, any>
    ): ToolExec<TArgs, TResult> {
      return async (args: TArgs) => {
        const start = Date.now();
        // minimally capture; redact if arguments may contain PII
        const common = { tool_name: name, ...baseProps, tool_args: args };
        try {
          // Mark tool-start span
          ph.capture({
            distinctId: baseProps?.posthogDistinctId ?? 'anonymous',
            event: '$ai_tool_start',
            properties: { ...common },
          });

          const result = await exec(args);

          ph.capture({
            distinctId: baseProps?.posthogDistinctId ?? 'anonymous',
            event: '$ai_tool_end',
            properties: {
              ...common,
              duration_ms: Date.now() - start,
              tool_success: true,
              // optional: size hints
              tool_result_type: typeof result,
            },
          });

          return result;
        } catch (err: any) {
          ph.capture({
            distinctId: baseProps?.posthogDistinctId ?? 'anonymous',
            event: '$ai_tool_error',
            properties: {
              ...common,
              duration_ms: Date.now() - start,
              tool_success: false,
              error_message: err?.message ?? 'Unknown error',
              error_name: err?.name,
            },
          });
          throw err;
        }
      };
    }

    const runId = crypto.randomUUID();
    const baseProps = {
      posthogDistinctId: modelCtx.userId,
      course_id: modelCtx.courseId,
      run_id: runId,
      source: 'sphereai-agent',
    };

    // Environment variables for external services
    const CX = process.env.GOOGLE_CX;
    const API_KEY = process.env.GOOGLE_SEARCH;
    const EXA_API_KEY = process.env.EXA_API_KEY;

    // Define schemas for structured outputs
    const GetCodeSchema = z.object({
      language: z.string().describe('Programming language for the code'),
      code: z
        .string()
        .min(10)
        .describe('The actual code in the specified language'),
      explanation: z.string().describe('Explanation of the cod'),
    });

    const GetSyllabusSchema = z.object({
      query: z
        .string()
        .min(2)
        .describe('The subject or concept for the syllabus'),
      syllabus: z.object({
        previousConcepts: z.array(z.string()).describe('Prerequisite concepts'),
        currentConcepts: z
          .array(
            z.object({
              topic: z.string().describe('Main topic'),
              subtopics: z
                .array(z.string())
                .describe('Subtopics under this topic'),
            })
          )
          .describe('Current concepts to learn'),
      }),
    });

    const SvgGenerationSchema = z.object({
      svg: z.string().describe('This must the code for SVG'),
    });

    const TestQuestionSchema = z.object({
      questions: z.array(
        z.object({
          question: z.string().describe('The actual question'),
          options: z
            .array(z.string())
            .length(4)
            .describe('Four answer options'),
          answer: z.string().describe('The correct answer'),
        })
      ),
    });

    const FlashcardSchema = z.object({
      flashcards: z.array(
        z.object({
          front: z.string().describe('Question or concept for the front'),
          back: z.string().describe('Summary or explanation for the back'),
        })
      ),
    });

    // Define tools using Vercel AI SDK - Fixed inputSchema to parameters
    const getSyllabusTools = tool({
      description: 'Get the syllabus for a course or subject',
      parameters: z.object({
        query: z.string().min(2).describe('The subject to get syllabus for'),
      }),
      execute: withToolTracing('getSyllabusTools', async ({ query }) => {
        console.log('Getting syllabus for:', query);

        // Use OpenRouter with structured output
        const result = await generateObject({
          model: tracedModel('openai/gpt-oss-20b:free',modelCtx),
          system:`Your role is to generate a detailed and structured syllabus in strict compliance with the provided schema.


          ## Core Rules

          1. **Interpret Vague Inputs**
             - The student's request may be very short, unclear, or broad (e.g., "AI", "Learn Python", "Quantum Computing").
             - Your task is to interpret the intended subject, identify its scope, and expand it into a **clear, logical learning path**.
             - Assume no prior knowledge unless the input specifies otherwise.

          2. **Previous Concepts**
             - List all prerequisite concepts the student should know before starting the main syllabus.
             - If the student is a beginner, include fundamental concepts needed to understand the topic.
             - Each prerequisite must be short, clear, and foundational.

          3. **Current Concepts**
             - Organize the main syllabus into **topics** in a logical learning sequence.
             - Under each topic, include **subtopics** that break it down into manageable learning units.
             - Each subtopic must be specific enough to guide self-study (avoid vague terms like "basics" without context).

          4. **Detail & Depth**
             - Expand the syllabus to cover all essential areas from beginner to advanced (where applicable).
             - Ensure subtopics follow a logical order, building from foundational ideas to more complex ones.
             - Avoid excessive technical jargon unless it is necessary and explained through its subtopics.

          5. **Output Format**
             - Output must strictly match the schema — no additional text, comments, or formatting outside the JSON structure.
             - Every string in previousConcepts, topic, and subtopics must be concise yet descriptive.

          6. **Objective**
             - The syllabus must be complete enough that a motivated student could follow it and gain a working understanding of the topic, starting from the prerequisites.
             - Always aim for clarity, logical flow, and practical learning progression.

          ## Output Expectation
          - Return only a valid JSON object matching the schema.
          - Do not include explanations, headings, or text outside the JSON.`,
          schema: GetSyllabusSchema,
          prompt: ` ${query}`,
        });

        return JSON.stringify(result.object);
      },
       phClient, baseProps),
    });

    const webSearchTools = tool({
      description: 'Search the web for information about a topic',
      parameters: z.object({
        query: z.string().min(2).describe('Query to search for'),
      }),
      execute:withToolTracing('webSearchTools', async ({ query })=> {
        console.log('Web searching for:', query);

        if (!EXA_API_KEY) {
          return JSON.stringify({ error: 'EXA API key not configured' });
        }

        try {
          const exa = new Exa(EXA_API_KEY);
          const response = await exa.searchAndContents(query, {
            type: 'neural',
            numResults: 5,
            text: true,
          });

          return JSON.stringify({
            query,
            results: response.results.map((r: any) => ({
              title: r.title,
              url: r.url,
              content: r.text?.substring(0, 500) + '...',
            })),
          });
        } catch (error) {
          console.error('Web search error:', error);
          return JSON.stringify({
            error: true,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },phClient, baseProps),
    });

    const knowledgeSearchTools = tool({
      description: 'Search the knowledge base for information',
      parameters: z.object({
        query: z.string().min(2).describe('Query to search knowledge base'),
      }),
      execute: withToolTracing('knowledgeSearchTools', async ({ query })=> {
        console.log('Knowledge searching for:', query);
        const result = await generateText({
          model: tracedModel('openai/gpt-oss-20b:free',modelCtx),
          system:`You are an intelligent knowledge retrieval assistant.
          Your role is to search the knowledge base and return the most relevant, accurate, and useful information in direct, clear, and well-structured text form.

          ## Response Rules

          1. **Understanding the Query**
             - Interpret the user’s query accurately, even if it is vague or informal.
             - Identify the most likely intent and context.
             - If the query is ambiguous, prioritize the most common and educational interpretation.

          2. **Information Quality**
             - Provide factually correct, precise, and relevant answers.
             - Cover the key points necessary for the user to fully understand the topic.
             - Avoid irrelevant filler or generic statements.

          3. **Structure & Clarity**
             - Organize your answer logically, starting with the most important point.
             - Use short paragraphs or lists for readability when applicable.
             - Define any technical terms in simple language.

          4. **Tone & Accessibility**
             - Write in a clear, concise, and student-friendly tone.
             - Assume the reader may have no prior knowledge of the topic.
             - Avoid overly complex sentences unless necessary for accuracy.

          5. **Depth & Completeness**
             - If the query asks “what,” focus on definitions and key details.
             - If the query asks “how,” focus on step-by-step explanations.
             - If the query is broad, give a concise overview and note important subtopics.

          6. **Prohibited Output**
             - Do not include unrelated tangents.
             - Do not output raw code unless specifically requested by the user.
             - Avoid personal opinions unless explicitly asked.

          ## Objective
          The user should receive a complete, standalone answer that:
          - Addresses their question directly.
          - Is clear and understandable on its own.
          - Can be read quickly but still conveys depth where needed.

          ## Output Format
          - Return only the answer text.
          - No meta-commentary, prefaces like “Here’s your answer,” or unrelated closing statements.`,
          prompt: ` ${query}`,
        });

        return result.text;
      },phClient, baseProps),
    });

    const getCodeTools = tool({
      description: 'Get code examples for programming topics',
      parameters: z.object({
        query: z.string().min(2).describe('Programming topic to get code for'),
        language: z.string().min(1).describe('Programming language'),
      }),
      execute: withToolTracing('getCodeTools', async ({ query, language })=> {
        console.log('Getting code for:', query, 'in', language);

        const result = await generateObject({
          model: tracedModel('openai/gpt-oss-20b:free',modelCtx),
          system:`You are a world-class programming tutor and code generator. Your task is to create correct, runnable code
          examples for the given topic and language, along with a clear explanation.
          Your output must strictly match the provided schema.

          ## Code Generation Rules

          1. **Interpret the Query**
             - Understand the requested topic and programming language, even if the query is short or vague.
             - If the topic is broad (e.g., "sorting"), pick a **representative, useful, and commonly used example**
               (e.g., "Implementing Bubble Sort" or "Merge Sort").
             - If the query is a specific concept (e.g., "Python list comprehension"), produce a focused example.

          2. **Code Quality**
             - Provide **complete runnable code** in the specified language — include necessary imports, setup, and function definitions.
             - Follow **best practices** for the given language (naming conventions, indentation, style).
             - Avoid deprecated or insecure methods.
             - Code should be **idiomatic** for the chosen language.

          3. **Explanation**
             - The explanation should be **clear, concise, and beginner-friendly**.
             - Explain what the code does step-by-step and why certain decisions were made.
             - If relevant, include a brief note on alternative approaches or real-world use cases.

          4. **Edge Cases & Examples**
             - If the topic benefits from it, include simple test cases or sample inputs/outputs in the code.
             - If handling user input or data, use safe and minimal examples.



          6. **Objective**
             - The student should be able to copy the code, run it immediately, and understand it from the explanation.
             - The output must be useful for both beginners and intermediate learners.

          ## Output Expectation

          - No additional text, headings, or comments outside the JSON.`,
          schema: GetCodeSchema,
          prompt: `Qurey -  ${query} language to use -  ${language}`,
        });

        return JSON.stringify(result.object);
      },phClient, baseProps),
    });

    const testTools = tool({
      description: 'Generate test questions on a topic',
      parameters: z.object({
        topic: z.string().min(1).describe('Topic for test questions'),
        no: z.number().min(1).max(10).describe('Number of questions'),
      }),
      execute: withToolTracing('testTools', async ({ topic, no })  => {
        console.log('Generating test for:', topic, 'with', no, 'questions');

        const result = await generateObject({
          model: tracedModel('openai/gpt-oss-20b:free',modelCtx),
          schema: TestQuestionSchema,
          system: `You are a world-class test generator. Your role is to create high-quality multiple-choice test questions
          that help students prepare effectively for exams. The questions must strictly match the provided schema.

          ## Question Design Rules

          1. **Coverage**
             - Cover the most essential concepts from the given topic.
             - If the topic is broad, distribute questions across different subareas to ensure variety.
             - Avoid repeating similar questions.

          2. **Question Quality**
             - Questions must be **clear, unambiguous, and grammatically correct**.
             - Each question should require thought — avoid trivial fact recall unless the topic demands it.
             - Ensure the question tests understanding, not just memorization.

          3. **Options & Correct Answer**
             - Provide exactly **4 options** for every question.
             - Only **1 option** must be correct.
             - Distractors (incorrect options) must be plausible and relevant but clearly incorrect upon careful thought.
             - Avoid “all of the above” or “none of the above” unless pedagogically necessary.

          4. **Difficulty Balance**
             - Mix **easy, medium, and slightly challenging** questions if the number of questions is more than 3.
             - Keep wording accessible for students at the intended level.


          5. **Objective**
             - The resulting test should give students a reliable way to check their knowledge before an exam.
             - Every question must test a different aspect of the topic unless the topic is very narrow.

          ## Output Expectation
          - .
          - No additional keys, explanations, or comments,follow the given schema.`,
          prompt: `no of question to create -  ${no}
          topic -  ${topic}. Each question`,
        });

        return result.object;
      },phClient, baseProps),
    });

    const svgTool = tool({
      description:
        'this tool is usefull to create visual represent the context by creating a SVG  diagram of that',
      parameters: z.object({
        Query: z.string(),
      }),
      execute: withToolTracing('svgTool', async ({ Query }) => {
        const result = await generateObject({
          model: tracedModel('openai/gpt-oss-20b:free',modelCtx),
          schema: SvgGenerationSchema,
          system: `Your role is to generate clean, minimalist, and visually appealing SVG code based on the provided prompt or description.

          Requirements:
          1. **Background & Contrast**
             - The SVG will be displayed on a black background. Use high-contrast, accessible colors (e.g., bright lines, text, and shapes against dark background).

          2. **Layout & Spacing**
             - The design must be **horizontally oriented** and optimized to fill half the screen width on a laptop display (approx. 600–700px wide). Height should be proportional for clarity.
             - Maintain generous spacing between elements to avoid visual crowding.
             - Avoid small, cramped shapes or text that becomes illegible when scaled.

          3. **Lines & Connections**
             - When connecting or joining elements, route lines around shapes instead of passing through them.
             - Use smooth curves or clear right-angle connectors to preserve readability.
             - Ensure no connecting line overlaps or obscures important information or labels.

          4. **Clarity & Minimalism**
             - Minimize unnecessary details while preserving clarity.
             - Use consistent stroke widths and font sizes.
             - Align text and shapes neatly to create a balanced composition.

          5. **Output Rules**
             - Output **only** the SVG markup—no explanations, comments, or extra text.
             - Ensure the SVG is valid and ready for direct embedding in HTML.

          Objective: The result should be a clear, aesthetically balanced SVG diagram that is easy to interpret at a glance, with no overlapping text, lines, or shapes that could reduce legibility.`,
          prompt: `${Query}`,
        });
        return result.object;
      },phClient, baseProps),
    });

    const flashcardsTools = tool({
      description: 'Create flashcards for studying a topic',
      parameters: z.object({
        query: z.string().min(2).describe('Topic for flashcards'),
        no: z.number().min(1).max(3).describe('Number of flashcards'),
      }),
      execute: withToolTracing('flashcardsTools', async ({ query, no }) => {
        console.log('Creating flashcards for:', query, 'count:', no);

        const result = await generateObject({
          model: tracedModel('openai/gpt-oss-20b:free',modelCtx),
          system:`Your role is to create clear, accurate, and engaging flashcards for studying a given topic.
          The flashcards must help the student actively recall and understand key concepts.
          Your output must strictly match the provided FlashcardSchema.

          ## Rules for Flashcard Creation

          1. **Input Understanding**
             - The "query" may be broad (e.g., "AI") or specific (e.g., "photosynthesis in plants").
             - Determine the key concepts most important for learning or recalling the topic.
             - Select concepts that will help the student understand fundamentals as well as slightly deeper details.

          2. **Flashcard Quality**
             - The front must be a **clear and specific** question, term, or prompt that encourages active recall.
             - The back must contain a **concise, accurate answer** or explanation that fully addresses the front.
             - Keep wording student-friendly and easy to read.
             - Avoid overly long sentences; focus on clarity and retention.

          3. **Question Types**
             - Use a mix of formats where appropriate:
               - Direct questions (e.g., "What is ...?")
               - Fill-in-the-blank
               - Term → definition
               - Concept → explanation
             - Avoid yes/no questions unless they test an important fact.

          4. **Depth & Relevance**
             - Ensure flashcards cover the **most essential points** for the given number requested.
             - If the topic is technical, balance basic definitions with slightly deeper or applied questions.

          5. **Formatting & Output**
             - Always produce exactly the number of flashcards requested in the "no" parameter.
             - Output must be **only** valid JSON matching the schema — no extra text, explanations, or formatting.
             - The "front" and "back" must each be a single string; no markdown, bullet points, or nested formatting.

          6. **Objective**
             - The student should be able to use the generated flashcards immediately for active recall practice.
             - The flashcards must make sense even if the student has no other reference material.`,
          schema: FlashcardSchema,
          prompt: `number to create -  ${no} qurey - ${query}.`,
        });

        return JSON.stringify(result.object);
      },phClient, baseProps),
    });



    // now we start the proccess of sending each stage into your AI agent which in return genrates the slides

    const stages = course.course?.stages;
    if (!Array.isArray(stages) || stages.length === 0) {
      throw new Error('No stages found for the course.');
    }

    const stageIds = [];

    for (const stage of stages) {
      const stagePrompt = `You are SphereAI, an advanced educational agent. Your mission is to produce a comprehensive, multi-slide learning module for the following stage of a course:
        Title: ${stage.title}
      Purpose: ${stage.purpose}
      Topics: ${stage.include.join(', ')}
      Outcome: ${stage.outcome}
      Discussion area: ${stage.discussion_prompt || ''}`;
      try {
        // Use generateText with tools, then parse the result
        const answer = await generateText({
          model: tracedModel('google/gemini-2.5-pro',modelCtx),
          system: `You are SphereAI — an advanced, structured educational content generator.
          Your mission is to produce a comprehensive, multi-slide learning module for any topic a student requests, by orchestrating your available tools in a logical sequence to create an engaging, easy-to-follow learning experience.

          Workflow & Tool Usage

          When a student provides a topic:

          Generate the Learning Roadmap

          Call getSyllabusTools to produce a detailed, structured syllabus covering prerequisite concepts and current learning concepts.

          Use this syllabus to guide slide sequencing and topic breakdown.

          Visual Support

          For each major concept, use svgTool to generate a clear, horizontally oriented, high-contrast SVG diagram.

          Always provide svgTool with a detailed and explicit prompt describing:

          The concept to illustrate

          Visual structure/layout

          Relationships between elements

          Avoiding any connecting lines crossing over key content

          Do NOT create SVGs for slides that are purely test, flashcard, table, or code examples.

          Key Concept Reinforcement

          Use flashcardsTools to create up to 3 high-quality flashcards per dedicated flashcard slide.

          Each flashcard must have a clear, concise question on the front and a precise answer on the back.

          Assessment

          Use testTools to create up to 10 multiple-choice questions for a dedicated test slide.

          Each question must have exactly 4 options and one correct answer.

          Ensure test questions cover all essential concepts in the learning module.

          Code Examples (if relevant)

          If the topic is programming-related, use getCodeTools to produce:

          Clean, well-commented code

          A short, clear explanation of what the code does

          Always place this in a dedicated code slide.

          Enrichment & Extra Context

          Use knowledgeSearchTools and/or webSearchTools to gather additional background, examples, and explanations that improve clarity and context.

          Use only reliable and educationally relevant details.

          Slide Construction Rules

          Main Content Slides

          Title: Clear and descriptive

          Subtitles: One-line summaries

          Content: Max 180 words, written in clear, student-friendly markdown

          SVG: From svgTool when relevant

          Links: 2–3 relevant external resources

          Bullet Points: Highlight key takeaways

          YoutubeSearchText: Helpful query for further exploration

          Flashcard Slides

          type: "flashcard"

          Only contain flashcards from flashcardsTools

          No main SVG or long content

          Test Slides

          type: "test"

          Only contain test questions from testTools

          Code Slides

          Contain code from getCodeTools in { language, content } format

          Include a short explanation in content

          User Experience Priority

          Order slides so the learning flow goes:

          Overview / Introduction

          Concept Slides (with SVGs)

          Flashcard Slide

          Test Slide

          Optional Code Slide (if applicable)

          Keep language engaging but concise.

          Avoid repeating information across slides.

          Output Rules

          Output ONLY valid JSON in the following structure:

          {
          "slides": [
          {
          "name": "slide 1",
          "title": "Main title",
          "subTitles": "Brief subtitle",
          "svg": "<svg>...</svg>",
          "content": "Markdown content (max 180 words)",
          "links": ["https://example.com"],
          "youtubeSearchText": "topic keyword search",
          "code": {
          "language": "javascript",
          "content": "console.log('Hello World');"
          },
          "tables": "Optional markdown table",
          "bulletPoints": ["Point 1", "Point 2"],
          "flashcardData": [
          { "question": "?", "answer": "..." }
          ],
          "testQuestions": [
          { "question": "?", "options": ["A","B","C","D"], "answer": "A" }
          ],
          "type": "markdown"
          }
          ]
          }

          No additional commentary, headers, or explanations outside the JSON.

          All tool outputs must be parsed and integrated into the final JSON structure.

          Maintain strict JSON validity — no trailing commas or formatting errors.`,
          prompt: stagePrompt,
          tools: {
            getSyllabusTools,
            webSearchTools,
            knowledgeSearchTools,
            getCodeTools,
            testTools,
            flashcardsTools,
            svgTool,
          },
          maxSteps: 10,
        });
        console.log('########################################################');
        console.log('the answer is', answer.text);
        console.log('########################################################');

        const result = await generateObject({
          model: tracedModel('openai/gpt-oss-20b:free',modelCtx),
          schema: AgentOutputSchema,
          prompt: `format the following information into the valid schema that we have provided ${answer.text} `,
          system: `"Convert all provided information into the specified valid schema.
            *   **Missing Information:** If schema fields are missing data, infer and populate them with contextually appropriate information.
            *   **Completeness:** Do NOT compress, summarize, or omit any given information.
            *   **Output:** Your sole task is to ensure the output strictly adheres to the provided schema's structure and format." `,
        });
        console.log('the final result is', result.object);

        const parsed = AgentOutputSchema.safeParse(result.object);
        if (!parsed.success) {
          phClient.capture({
                    distinctId: modelCtx.userId,
                    event: '$ai_validation_error',
                    properties: {
                      course_id: args.courseId,
                      run_id: runId,
                      stage_title: stage.title,
                      issues: JSON.stringify(parsed.error.issues),
                    },
                  });
          console.error('Invalid structured output:', parsed.error.format());
          console.log(
            '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'
          );
          console.log(
            'Raw structured output:',
            JSON.stringify(result.object, null, 2)
          );
          console.log(
            '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@'
          );


          // Log specific field errors for debugging
          if (parsed.error.issues) {
            console.error('Validation issues:', parsed.error.issues);
          }

          throw new Error('Agent returned invalid structured content.');
        }

        const stageId = await ctx.runMutation(api.stage.createstage, {
          courseId: args.courseId,
          title: stage.title,
          slides: parsed.data.slides,
        });
        stageIds.push(stageId);
      } catch (error) {
        phClient.capture({
                distinctId: modelCtx.userId,
                event: '$ai_stage_error',
                properties: {
                  course_id: args.courseId,
                  run_id: runId,
                  stage_title: stage.title,
                  error_message: error instanceof Error ? error.message : String(error),
                  error_name: error instanceof Error ? error.name : 'UnknownError',
                },
              });
        console.error('Agent processing error:', error);
      }
    }
 await phClient.shutdown()
    return stageIds;
  },
});
