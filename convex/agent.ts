'use node';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject, generateText, tool } from 'ai';
import { v } from 'convex/values';
import Exa from 'exa-js';
import { z } from 'zod';
import { AgentOutputSchema } from '../src/SlidesSchema';
import { api } from './_generated/api';
import { action } from './_generated/server';

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

    // Create OpenRouter client
    const openrouter = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: openRouterKey,
    });

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
      explanation: z.string().describe('Explanation of the code'),
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
      execute: async ({ query }) => {
        console.log('Getting syllabus for:', query);

        // Use OpenRouter with structured output
        const result = await generateObject({
          model: openrouter('google/gemini-2.5-flash-lite'),
          schema: GetSyllabusSchema,
          prompt: `Generate a comprehensive syllabus for ${query}. Include prerequisite concepts and current concepts with topics and subtopics.`,
        });

        return JSON.stringify(result.object);
      },
    });

    const webSearchTools = tool({
      description: 'Search the web for information about a topic',
      parameters: z.object({
        query: z.string().min(2).describe('Query to search for'),
      }),
      execute: async ({ query }) => {
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
      },
    });

    const knowledgeSearchTools = tool({
      description: 'Search the knowledge base for information',
      parameters: z.object({
        query: z.string().min(2).describe('Query to search knowledge base'),
      }),
      execute: async ({ query }) => {
        console.log('Knowledge searching for:', query);
        const result = await generateObject({
          model: openrouter('google/gemini-2.5-flash-lite'),
          schema: GetCodeSchema,
          prompt: ` ${query}`,
        });

        return result.object;
      },
    });

    const getCodeTools = tool({
      description: 'Get code examples for programming topics',
      parameters: z.object({
        query: z.string().min(2).describe('Programming topic to get code for'),
        language: z.string().min(1).describe('Programming language'),
      }),
      execute: async ({ query, language }) => {
        console.log('Getting code for:', query, 'in', language);

        const result = await generateObject({
          model: openrouter('google/gemini-2.5-flash-lite'),
          schema: GetCodeSchema,
          prompt: `Generate code for ${query} in ${language}. Include the code and a clear explanation.`,
        });

        return JSON.stringify(result.object);
      },
    });

    const testTools = tool({
      description: 'Generate test questions on a topic',
      parameters: z.object({
        topic: z.string().min(1).describe('Topic for test questions'),
        no: z.number().min(1).max(10).describe('Number of questions'),
      }),
      execute: async ({ topic, no }) => {
        console.log('Generating test for:', topic, 'with', no, 'questions');

        const result = await generateObject({
          model: openrouter('google/gemini-2.5-flash-lite'),
          schema: TestQuestionSchema,
          system: `You are a world-class test generator. Your job is to create comprehensive tests based
          on the provided topic. Remember that students will use these tests for exam preparation, so ensure
          they cover all essential aspects of the subject matter.Always adhere precisely to the provided schema. `,
          prompt: `Create ${no} multiple choice questions on the topic ${topic}. Each question
          should have exactly 4 options with one correct answer.`,
        });

        return result.object;
      },
    });

    const svgTool = tool({
      description:
        'this tool is usefull to create visual represent the context by creating a SVG  diagram of that',
      parameters: z.object({
        Query: z.string(),
      }),
      execute: async ({ Query }) => {
        const result = await generateObject({
          model: openrouter('google/gemini-2.5-flash-lite'),
          schema: SvgGenerationSchema,
          system: `Your role is to generate minimalist SVG code based on the provided prompt or description.
          The SVG will be displayed on a black background, so prioritize high contrast and accessibility in
          your design choices. Output strictly the SVG markup; do not include any explanations, comments, or additional text.
          Always adhere precisely to the provided schema, The SVG must be horizontally oriented and designed to fill half the screen width on a laptop display, with any appropriate height.`,
          prompt: `${Query}`,
        });
        return result.object;
      },
    });

    const flashcardsTools = tool({
      description: 'Create flashcards for studying a topic',
      parameters: z.object({
        query: z.string().min(2).describe('Topic for flashcards'),
        no: z.number().min(1).max(3).describe('Number of flashcards'),
      }),
      execute: async ({ query, no }) => {
        console.log('Creating flashcards for:', query, 'count:', no);

        const result = await generateObject({
          model: openrouter('google/gemini-2.5-flash-lite'),
          schema: FlashcardSchema,
          prompt: `Generate ${no} flashcards on the topic ${query}. Each flashcard should have a clear question/concept on the front and a concise answer/explanation on the back.`,
        });

        return JSON.stringify(result.object);
      },
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
          model: openrouter('google/gemini-2.5-flash-lite-preview-06-17'),
          system: `You are SphereAI, an advanced educational agent. Your mission is to produce a comprehensiv
          e, multi-slide learning module for any topic a student asks about.

          You must use your available tools to gather all the necessary components for the learning
          module. For any given topic, you should:

          1. Use "getSyllabusTools" to get a detailed syllabus
          2. Use "svgTool" to generate visually appealing diagrams - when using this tool make sure that you
          provide a detailed prompt explaining everything that you want and how you want it, be very very specific
          3. Use "flashcardsTools" to create flashcards for key concepts (max 3 per slide)
          4. Use "testTools" to create assessment questions (max 10 questions per request)
          5. If the topic is code-related, use "getCodeTools" to get code examples
          6. Use "webSearchTools" and "knowledgeSearchTools" to enrich your content

          CRITICAL: After calling tools, you MUST parse their JSON results and extract the data to populate your final response.


          After gathering all information from tools, you must output a valid JSON object that matches this structure:
          {
            "slides": [
              {
                "name": "slide 1",
                "title": "Main title of the slide",
                "subTitles": "Brief subtitle or summary",
                "svg": "<svg>...</svg>",
                "content": "Main explanation in markdown (max 180 words)",
                "links": ["https://example.com/resource1", "https://example.com/resource2"],
                "youtubeSearchText": "Search query for YouTube exploration",
                "code": {
                  "language": "javascript",
                  "content": "console.log('Hello World');"
                },
                "tables": "Optional table in markdown format",
                "bulletPoints": ["Key point 1", "Key point 2"],
                "flashcardData": [
                  {
                    "question": "What is X?",
                    "answer": "X is..."
                  }
                ],
                "testQuestions": [
                  {
                    "question": "What is the correct answer?",
                    "options": ["A", "B", "C", "D"],
                    "answer": "A"
                  }
                ],
                "type": "markdown"
              }
            ]
          }

          IMPORTANT: You must use the results from your tool calls to populate the fields:
          - Use SVG diagrams from svgTool results for the "svg" field
          - Use flashcard data from flashcardsTools results for the "flashcardData" field
          - Use test questions from testTools results for the "testQuestions" field
          - Use code examples from getCodeTools results for the "code" field
          - Generate SVG diagrams that are relevant to the topic and enhance understanding
          - You don't need to show SVG diagrams for test slides, flashcard slides, table slides, or code slides
          - Focus on creating SVG diagrams that visually represent concepts, processes, or structures
          - always make sure that you render the test and flash card in the new slide , so that we can provide better learning experience
          - alway rember that to keep the user expreience high so struture the content in a way that is easy to understand and follow
          - When creating test questions, always create a dedicated slide with type "test" for the test questions
          - When creating flashcards, always create a dedicated slide with type "flashcard" for the flashcards
          - Structure the content so that test questions and flashcards are on separate slides from the main content

          Your final response must be ONLY valid JSON, no additional text or explanations.`,
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
          model: openrouter('google/gemini-2.5-flash-lite'),
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
        console.error('Agent processing error:', error);
      }
    }

    return stageIds;
  },
});
