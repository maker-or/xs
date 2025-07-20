"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { AgentOutputSchema } from "../src/SlidesSchema";
import { generateObject, tool, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import Exa from "exa-js";
import { getEmbedding } from "../src/utils/embeddings";
import { Pinecone } from "@pinecone-database/pinecone";
import { groq } from "@ai-sdk/groq";

export const agent = action({
  args: {
    chatId: v.id("chats"),
    messages: v.string(),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args): Promise<any> => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    console.log("Agent received message:", args.messages);

    // Get API key from environment
    const openRouterKey = process.env.OPENROUTER_API_KEY || "";
    if (!openRouterKey) {
      throw new Error(
        "OpenRouter API key is required. Please add your API key in settings.",
      );
    }

    if (!openRouterKey.startsWith("sk-")) {
      throw new Error(
        "Invalid OpenRouter API key format. Key should start with 'sk-'",
      );
    }

    // Create OpenRouter client
    const openrouter = createOpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: openRouterKey,
    });

    // Create assistant message
    const assistantMessageId: any = await ctx.runMutation(
      api.message.addMessage,
      {
        chatId: args.chatId,
        role: "assistant",
        content: "",
        parentId: args.parentMessageId,
      },
    );

    // Environment variables for external services
    const CX = process.env.GOOGLE_CX;
    const API_KEY = process.env.GOOGLE_SEARCH;
    const EXA_API_KEY = process.env.EXA_API_KEY;
    const PINECONE_API_KEY = process.env.PINECONE_API_KEY;

    if (!PINECONE_API_KEY) {
      throw new Error("Pinecone API key is required");
    }

    const PineconeClient = new Pinecone({
      apiKey: PINECONE_API_KEY,
    });
    const index = PineconeClient.index("docling");

    // Define schemas for structured outputs
    const GetCodeSchema = z.object({
      language: z.string().describe("Programming language for the code"),
      code: z
        .string()
        .min(10)
        .describe("The actual code in the specified language"),
      explanation: z.string().describe("Explanation of the code"),
    });

    const GetSyllabusSchema = z.object({
      query: z
        .string()
        .min(2)
        .describe("The subject or concept for the syllabus"),
      syllabus: z.object({
        previousConcepts: z.array(z.string()).describe("Prerequisite concepts"),
        currentConcepts: z
          .array(
            z.object({
              topic: z.string().describe("Main topic"),
              subtopics: z
                .array(z.string())
                .describe("Subtopics under this topic"),
            }),
          )
          .describe("Current concepts to learn"),
      }),
    });

    const TestQuestionSchema = z.object({
      questions: z.array(
        z.object({
          question: z.string().describe("The actual question"),
          options: z
            .array(z.string())
            .length(4)
            .describe("Four answer options"),
          answer: z.string().describe("The correct answer"),
        }),
      ),
    });

    const FlashcardSchema = z.object({
      flashcards: z.array(
        z.object({
          front: z.string().describe("Question or concept for the front"),
          back: z.string().describe("Summary or explanation for the back"),
        }),
      ),
    });

    // Define tools using Vercel AI SDK - Fixed inputSchema to parameters
    const getSyllabusTools = tool({
      description: "Get the syllabus for a course or subject",
      parameters: z.object({
        query: z.string().min(2).describe("The subject to get syllabus for"),
      }),
      execute: async ({ query }) => {
        console.log("Getting syllabus for:", query);

        // Use OpenRouter with structured output
        const result = await generateObject({
          model: openrouter("google/gemini-2.5-flash"),
          schema: GetSyllabusSchema,
          prompt: `Generate a comprehensive syllabus for ${query}. Include prerequisite concepts and current concepts with topics and subtopics.`,
        });

        return JSON.stringify(result.object);
      },
    });

    const getImagesTools = tool({
      description: "Get images related to a topic",
      parameters: z.object({
        query: z.string().min(2).describe("Query to search for images"),
      }),
      execute: async ({ query }) => {
        console.log("Getting images for:", query);

        if (!CX || !API_KEY) {
          return JSON.stringify({
            error: "Google Custom Search not configured",
          });
        }

        const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${CX}&searchType=image&num=10&q=${encodeURIComponent(query)}&imgSize=medium&imgType=photo&safe=active`;

        try {
          const res = await fetch(url);
          if (!res.ok) {
            return JSON.stringify({
              error: true,
              status: res.status,
              message: `Failed to fetch images: ${res.statusText}`,
            });
          }

          const data = await res.json();

          // Filter and validate images
          const images = (data.items || [])
            .map((item: any) => ({
              title: item.title,
              link: item.link,
              thumbnail: item.image?.thumbnailLink,
              contextLink: item.image?.contextLink,
              mime: item.mime,
              width: item.image?.width,
              height: item.image?.height,
            }))
            .filter((img: any) => {
              // Filter out invalid or problematic images
              return (
                img.link &&
                (img.link.startsWith("http://") ||
                  img.link.startsWith("https://")) &&
                !img.link.includes("x-raw-image") &&
                !img.link.includes("data:image") &&
                img.mime &&
                (img.mime.startsWith("image/") || img.mime.includes("image")) &&
                img.width &&
                img.height &&
                parseInt(img.width) > 100 &&
                parseInt(img.height) > 100
              );
            })
            .slice(0, 5); // Limit to top 5 valid images

          return JSON.stringify({
            query,
            count: images.length,
            images,
          });
        } catch (error: any) {
          return JSON.stringify({
            error: true,
            message:
              error instanceof Error
                ? `Failed to fetch images: ${error.message}`
                : "Unknown error",
          });
        }
      },
    });

    const webSearchTools = tool({
      description: "Search the web for information about a topic",
      parameters: z.object({
        query: z.string().min(2).describe("Query to search for"),
      }),
      execute: async ({ query }) => {
        console.log("Web searching for:", query);

        if (!EXA_API_KEY) {
          return JSON.stringify({ error: "EXA API key not configured" });
        }

        try {
          const exa = new Exa(EXA_API_KEY);
          const response = await exa.searchAndContents(query, {
            type: "neural",
            numResults: 5,
            text: true,
          });

          return JSON.stringify({
            query,
            results: response.results.map((r: any) => ({
              title: r.title,
              url: r.url,
              content: r.text?.substring(0, 500) + "...",
            })),
          });
        } catch (error) {
          console.error("Web search error:", error);
          return JSON.stringify({
            error: true,
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      },
    });

    const knowledgeSearchTools = tool({
      description: "Search the knowledge base for information",
      parameters: z.object({
        query: z.string().min(2).describe("Query to search knowledge base"),
      }),
      execute: async ({ query }) => {
        console.log("Knowledge searching for:", query);

        try {
          const embeddings = await getEmbedding(query);
          const semanticSearch = await index.namespace("__default__").query({
            vector: embeddings,
            topK: 5,
            includeMetadata: true,
            includeValues: false,
          });

          const textContent = semanticSearch.matches
            .map((match) => match.metadata?.text)
            .filter(Boolean);

          const resultsString = textContent.join("\n\n");

          if (resultsString.trim() === "") {
            return JSON.stringify({
              message: `No relevant information found for "${query}"`,
            });
          }

          return JSON.stringify({
            query,
            results: resultsString,
          });
        } catch (error) {
          console.error("Knowledge search error:", error);
          return JSON.stringify({
            error: true,
            message: error instanceof Error ? error.message : "Unknown error",
          });
        }
      },
    });

    const getCodeTools = tool({
      description: "Get code examples for programming topics",
      parameters: z.object({
        query: z.string().min(2).describe("Programming topic to get code for"),
        language: z.string().min(1).describe("Programming language"),
      }),
      execute: async ({ query, language }) => {
        console.log("Getting code for:", query, "in", language);

        const result = await generateObject({
          model: openrouter("google/gemini-2.5-flash"),
          schema: GetCodeSchema,
          prompt: `Generate code for ${query} in ${language}. Include the code and a clear explanation.`,
        });

        return JSON.stringify(result.object);
      },
    });

    const testTools = tool({
      description: "Generate test questions on a topic",
      parameters: z.object({
        topic: z.string().min(1).describe("Topic for test questions"),
        no: z.number().min(1).max(10).describe("Number of questions"),
      }),
      execute: async ({ topic, no }) => {
        console.log("Generating test for:", topic, "with", no, "questions");

        const result = await generateObject({
          model: openrouter("google/gemini-2.5-flash"),
          schema: TestQuestionSchema,
          prompt: `Create ${no} multiple choice questions on the topic ${topic}. Each question should have exactly 4 options with one correct answer.`,
        });

        return JSON.stringify(result.object);
      },
    });

    const flashcardsTools = tool({
      description: "Create flashcards for studying a topic",
      parameters: z.object({
        query: z.string().min(2).describe("Topic for flashcards"),
        no: z.number().min(1).max(3).describe("Number of flashcards"),
      }),
      execute: async ({ query, no }) => {
        console.log("Creating flashcards for:", query, "count:", no);

        const result = await generateObject({
          model: openrouter("google/gemini-2.5-flash"),
          schema: FlashcardSchema,
          prompt: `Generate ${no} flashcards on the topic ${query}. Each flashcard should have a clear question/concept on the front and a concise answer/explanation on the back.`,
        });

        return JSON.stringify(result.object);
      },
    });

    try {
      // Use generateText with tools, then parse the result
      const result = await generateText({
        model: openrouter("google/gemini-2.5-flash"),
        system: `You are SphereAI, an advanced educational agent. Your mission is to produce a comprehensive, multi-slide learning module for any topic a student asks about.

You must use your available tools to gather all the necessary components for the learning module. For any given topic, you should:

1. Use "getSyllabusTools" to get a detailed syllabus
2. Use "getImagesTools" to get relevant images - IMPORTANT: Only use valid image URLs that start with http:// or https://
3. Use "flashcardsTools" to create flashcards for key concepts (max 3 per slide)
4. Use "testTools" to create assessment questions (max 10 questions per request)
5. If the topic is code-related, use "getCodeTools" to get code examples
6. Use "webSearchTools" and "knowledgeSearchTools" to enrich your content

CRITICAL: After calling tools, you MUST parse their JSON results and extract the data to populate your final response.

When processing images from getImagesTools:
- CRITICAL: Extract the "link" field from the first valid image in the results
- Set the "picture" field in your output to this exact URL
- Ensure the URL starts with http:// or https://
- Example: If getImagesTools returns {"images": [{"link": "https://example.com/image.jpg"}]}, set "picture": "https://example.com/image.jpg"
- DO NOT use placeholder URLs like "https://example.com" - use actual URLs from the tool results
- If no valid images are found, leave the picture field empty ("")

After gathering all information from tools, you must output a valid JSON object that matches this structure:
{
  "slides": [
    {
      "name": "slide 1",
      "title": "Main title of the slide",
      "subTitles": "Brief subtitle or summary",
      "picture": "https://example.com/image.jpg",
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
- Use image URLs from getImagesTools results for the "picture" field
- Use flashcard data from flashcardsTools results for the "flashcardData" field
- Use test questions from testTools results for the "testQuestions" field
- Use code examples from getCodeTools results for the "code" field
- for image or picture don't use any book cover or the images of text book
- you don't need to show images for test or the flash cards or for the tables or the code
- try to retrive only relevant images for the topic
- always make sure that you render the test and flash card in the new slide , so that we can provide better learning experience
- alway rember that to keep the user expreience high so struture the content in a way that is easy to understand and follow
- When creating test questions, always create a dedicated slide with type "test" for the test questions
- When creating flashcards, always create a dedicated slide with type "flashcard" for the flashcards
- Structure the content so that test questions and flashcards are on separate slides from the main content

Your final response must be ONLY valid JSON, no additional text or explanations.`,
        prompt: args.messages,
        tools: {
          getSyllabusTools,
          getImagesTools,
          webSearchTools,
          knowledgeSearchTools,
          getCodeTools,
          testTools,
          flashcardsTools,
        },
        maxSteps: 10,
      });

      console.log("the final result is", result);
      console.log("tool results:", result.toolResults);

      // Log tool results for debugging
      if (result.toolResults) {
        result.toolResults.forEach((toolResult, index) => {
          console.log(
            `Tool ${index + 1} (${toolResult.toolName}):`,
            toolResult.result,
          );
        });
      }

      // Function to extract JSON from text that might have additional content
      const extractJSON = (text: string): any => {
        // Try to find JSON object in the text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // If no match, try parsing the entire text
        return JSON.parse(text);
      };

      // Parse the result as JSON
      let structuredOutput: any;
      try {
        structuredOutput = extractJSON(result.text);
        console.log("Successfully parsed JSON from result");
      } catch (parseError) {
        console.error("Failed to parse result as JSON:", parseError);
        console.error("Raw result text:", result.text);

        // Fallback: construct output from tool results
        structuredOutput = {
          slides: [
            {
              name: "slide 1",
              title: "Learning Module",
              subTitles: "Generated content based on your query",
              picture: "",
              content: "Generated content based on your query",
              links: [],
              youtubeSearchText: "Learn more about this topic",
              code: {
                language: "javascript",
                content: "// Code example will be generated",
              },
              tables: "",
              bulletPoints: [],
              flashcardData: [],
              testQuestions: [],
              type: "markdown",
            },
          ],
        };

        // Process tool results if available
        if (result.toolResults) {
          for (const toolResult of result.toolResults) {
            try {
              const parsedResult = JSON.parse(toolResult.result);

              switch (toolResult.toolName) {
                case "getImagesTools":
                  if (parsedResult.images && parsedResult.images.length > 0) {
                    // Find the first valid image URL
                    const validImage = parsedResult.images.find(
                      (img: any) =>
                        img.link &&
                        (img.link.startsWith("http://") ||
                          img.link.startsWith("https://")) &&
                        !img.link.includes("x-raw-image"),
                    );
                    if (validImage) {
                      structuredOutput.slides[0].picture = validImage.link;
                    }
                  }
                  break;
                case "flashcardsTools":
                  structuredOutput.slides[0].flashcardData =
                    parsedResult.flashcards?.map((card: any) => ({
                      question: card.front,
                      answer: card.back,
                    })) || [];
                  break;
                case "testTools":
                  structuredOutput.slides[0].testQuestions =
                    parsedResult.questions || [];
                  break;
                case "getCodeTools":
                  structuredOutput.slides[0].code = {
                    language: parsedResult.language,
                    content: parsedResult.code,
                  };
                  break;
                case "webSearchTools":
                case "knowledgeSearchTools":
                  if (parsedResult.results) {
                    structuredOutput.slides[0].content +=
                      "\n\n" +
                      (typeof parsedResult.results === "string"
                        ? parsedResult.results
                        : JSON.stringify(parsedResult.results));
                  }
                  break;
              }
            } catch (toolParseError) {
              console.warn(
                "Failed to parse tool result:",
                toolResult.toolName,
                toolParseError,
              );
            }
          }
        }
      }

      // Debug: log the structured output
      console.log(
        "Final structured output:",
        JSON.stringify(structuredOutput, null, 2),
      );

      // Validate against schema
      const parsed = AgentOutputSchema.safeParse(structuredOutput);
      if (!parsed.success) {
        console.error("Invalid structured output:", parsed.error.format());
        console.error(
          "Raw structured output:",
          JSON.stringify(structuredOutput, null, 2),
        );

        // Log specific field errors for debugging
        if (parsed.error.issues) {
          console.error("Validation issues:", parsed.error.issues);
        }

        throw new Error("Agent returned invalid structured content.");
      }

      // Update message with successful result
      await ctx.runMutation(api.message.updateMessage, {
        messageId: assistantMessageId,
        content: JSON.stringify({ slides: parsed.data.slides }),
      });

      await ctx.runMutation(api.message.signalProcessingComplete, {
        parentMessageId: args.parentMessageId,
        assistantMessageId: assistantMessageId,
      });

      return assistantMessageId;
    } catch (error) {
      console.error("Agent processing error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      try {
        await ctx.runMutation(api.message.updateMessage, {
          messageId: assistantMessageId,
          content: JSON.stringify({
            error: true,
            message: errorMessage,
            slides: [],
          }),
        });

        await ctx.runMutation(api.message.signalProcessingComplete, {
          parentMessageId: args.parentMessageId,
          assistantMessageId: assistantMessageId,
        });
      } catch (updateError) {
        console.error("Failed to update message with error:", updateError);
      }

      throw new Error(`Agent processing failed: ${errorMessage}`);
    }
  },
});
