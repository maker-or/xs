"use node";
import {
  Agent,
  tool,
  Runner,
  setDefaultOpenAIClient,
  setDefaultOpenAIKey,
  setTracingDisabled,
  OpenAIChatCompletionsModel,
} from "@openai/agents";
import { z } from "zod";
import { setOpenAIAPI } from "@openai/agents";
import { AgentOutputSchema } from "../src/SlidesSchema";
import Exa from "exa-js";
import OpenAI from "openai";
import { api } from "./_generated/api";
import { getEmbedding } from "../src/utils/embeddings";
import { Pinecone } from "@pinecone-database/pinecone";
import { zodResponseFormat } from "openai/helpers/zod";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { parseNestedJson } from "./parseNestedJson";

export const agent = action({
  args: {
    chatId: v.id("chats"),
    messages: v.string(),
    parentMessageId: v.optional(v.id("messages")),
  },
  handler: async (ctx, args): Promise<any> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    console.log(
      "this is from the agent the message i have recived is",
      args.messages,
    );

    // Instantiate a chat completions model for the agent
    // const model = aisdk(openai("o4-mini"));

    console.log("Calling api.saveApiKey.getkey");
    // const decryptedKey = await ctx.runQuery(api.saveApiKey.getkey, {});

    // let openRouterKey = decryptedKey || "";

    // Fallback to environment variable if no user key is stored

    const openRouterKey = process.env.OPENROUTER_API_KEY || "";

    if (!openRouterKey) {
      throw new Error(
        "OpenRouter API key is required. Please add your API key in settings.",
      );
    }

    // Validate API key format
    if (!openRouterKey.startsWith("sk-")) {
      throw new Error(
        "Invalid OpenRouter API key format. Key should start with 'sk-'",
      );
    }

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

    const token = process.env.GITHUB_TOKEN;
    const endpoint = "https://models.github.ai/inference";
    //google image search
    const CX = process.env.GOOGLE_CX;
    const API_KEY = process.env.GOOGLE_SEARCH;

    const openrouter = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: openRouterKey,
      defaultHeaders: {
        Referer: "https://sphereai.in", // Optional: for OpenRouter analytics
        "X-Title": "sphereai.in",
      },
    });

    const githubClient = new OpenAI({
      baseURL: endpoint,
      apiKey: token,
    });

    setDefaultOpenAIClient(githubClient);
    setOpenAIAPI("chat_completions");
    setDefaultOpenAIKey(openRouterKey);
    setTracingDisabled(true);

    const chatModel = new OpenAIChatCompletionsModel(
      githubClient,
      "openai/o4-mini",
    );
    if (!process.env.PINECONE_API_KEY) {
      throw new Error("Pinecone API key is required");
    }

    const PineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    //index name where vector similarity will search
    const index = PineconeClient.index("docling");
    //*****************************************************************************************************************************
    //defining the schema for the output for the llm tools
    //*****************************************************************************************************************************
    const GetCodeSchema = z.object({
      language: z
        .string()
        .describe(
          "it is used to specify the programming language that the actual code must be in ",
        ),
      code: z
        .string()
        .min(10)
        .describe("it contain the actaul code in the described language"),
      explanation: z
        .string()
        .describe("it contains the explanation of the code"),
    });

    const GetSyllabusSchema = z.object({
      query: z
        .string()
        .min(2)
        .describe(
          "The subject or concept user wants the syllabus for, e.g., 'Calculus', 'Machine Learning'",
        ),

      syllabus: z.object({
        previousConcepts: z
          .array(z.string())
          .describe(
            "A list of prerequisite concepts the student should understand before learning the current topic",
          ),

        currentConcepts: z
          .array(
            z.object({
              topic: z
                .string()
                .describe("The main topic under the current subject"),

              subtopics: z
                .array(z.string())
                .describe("List of subtopics under this topic"),
            }),
          )
          .describe(
            "Topics and their subtopics that the student needs to learn for full understanding of the subject",
          ),
      }),
    });

    const TestQuestionSchema = z.object({
      questions: z.array(
        z.object({
          question: z
            .string()
            .describe("this usually contains the actual question"),
          options: z
            .array(z.string())
            .length(4)
            .describe(
              "thse usually consist of 4 options which are dispayed with the corressponding question",
            ),
          answer: z
            .string()
            .describe(
              "this usually contain the the correct answer or the option corresponding to that particular question",
            ),
        }),
      ),
    });

    const FlashcardSchema = z.object({
      flashcards: z.array(
        z.object({
          front: z
            .string()
            .describe(
              "this usually consists of a question or concept that is displayed at the front of a flashcard",
            ), // question/concept
          back: z
            .string()
            .describe(
              "this usually consists of a summary or explanation that is displayed at the back of a flashcard",
            ), // summary/explanation
        }),
      ),
    });
    // ###################################################################################################################################
    // creating different tools that your agent as use
    // ###################################################################################################################################

    const getsyllabus = tool({
      name: "get_syllabus",
      description: "Get the syllabus for a course.",
      parameters: z.object({
        query: z
          .string()
          .min(2)
          .describe(
            "The query to search for a particular image that best suits the context.",
          ),
      }),
      async execute({ query }) {
        console.log("the getsyllabus tool is called to know the syllabus");
        const result = await openrouter.chat.completions.create({
          model: "moonshotai/kimi-k2:free",
          messages: [
            { role: "user", content: `${query}` },
            {
              role: "system",
              content: `You are an educational assistant helping students master academic subjects. Your goal is to generate a structured syllabus based on a user's query.

                When the user provides a topic or subject (e.g., "Machine Learning", "Calculus", "Thermodynamics"), return a well-structured JSON object that includes:

                1. **Previous Concepts**
                   - A list of prerequisite concepts the student should understand before learning the current topic.
                   - These are foundational ideas that provide necessary context.

                2. **Current Concepts**
                   - A list of key topics the student needs to learn for this subject.
                   - Each topic must include a topic name and a list of subtopics that cover the topic thoroughly.
                   - Subtopics should be concise but meaningful and focused on conceptual clarity and mastery.

                Your response must follow the JSON structure defined`,
            },
          ],
          response_format: zodResponseFormat(
            GetSyllabusSchema,
            "GetSyllabusSchema",
          ),
        });
        console.log(
          "the reuslt with parsed",
          result.choices[0].message.content,
        );
        console.log("the reuslt", result);
        return result.choices[0].message.content;
      },
      strict: true,
    });

    const getimages = tool({
      name: "getimages",
      description: "Get images related to a topic.",
      parameters: z.object({
        query: z
          .string()
          .min(2)
          .describe(
            "The query to search for a particular image that best suits the context.",
          ),
      }),
      async execute({ query }) {
        console.log("the getimages tool is called to get images");
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CX}&searchType=image&key=${API_KEY}&num=10`;
        try {
          const res = await fetch(url);
          if (!res.ok) {
            return {
              error: true,
              status: res.status,
              message: `Failed to fetch images: ${res.statusText}`,
            };
          }
          const data = await res.json();
          const images = (data.items || []).map((item: any) => ({
            title: item.title,
            link: item.link,
            thumbnail: item.image?.thumbnailLink,
            contextLink: item.image?.contextLink,
            mime: item.mime,
          }));
          return {
            query,
            count: images.length,
            images,
          };
        } catch (error: any) {
          return {
            error: true,
            message:
              error instanceof Error
                ? `Failed to fetch images: ${error.message}`
                : "Unknown error",
          };
        }
      },
    });

    const websearch = tool({
      name: "web_search",
      description: "Search the web to get more information about a topic.",
      parameters: z.object({
        query: z.string().min(2).describe("The query to search for."),
      }),
      async execute({ query }) {
        console.log(`the wrb search tool is called to search ${query}`);
        const exaApiKeyValue = process.env.EXA_API_KEY;
        if (!exaApiKeyValue) {
          throw new Error("EXA API key is required for web search");
        }

        try {
          const exa = new Exa(exaApiKeyValue);
          const response = await exa.searchAndContents(query, {
            type: "neural",
            numResults: 5,
            text: true,
            outputSchema: {
              title: z.string().min(2).describe("The title of the article."),
              url: z.string().url().describe("The URL of the article."),
              content: z
                .string()
                .min(10)
                .describe("The content of the article."),
            },
          });
          return `Results for ${query} is ${JSON.stringify(response, null, 2)}`;
        } catch (error) {
          console.error("Web search error:", error);
          return `Web search failed for "${query}": ${error instanceof Error ? error.message : "Unknown error"}`;
        }
      },
    });

    const knowledgesearch = tool({
      name: "knowledge_search",
      description:
        "Search the knowledge base to get more information about a topic.",
      parameters: z.object({
        query: z.string().min(2).describe("The query to search for."),
      }),
      async execute({ query }) {
        try {
          console.log(
            "the knowledge search qurey is called to get info from the knowledge base",
            query,
          );
          const embeddings = await getEmbedding(query);
          const Semantic_search = await index.namespace("__default__").query({
            vector: embeddings,
            topK: 5,
            includeMetadata: true,
            includeValues: false,
          });
          console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
          console.log("the Semantic_search is : ", Semantic_search);
          console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

          // Extract only the text content from semantic search results
          const textContent = Semantic_search.matches
            .map((match) => match.metadata?.text)
            .filter(Boolean);
          console.log("the textcontent is : ", textContent);
          const resultsString = textContent.join("\n\n");
          console.log("the resultsString is : ", resultsString);

          if (resultsString.trim() === "") {
            return `No relevant information found for "${query}"`;
          }

          return `Results for ${query} is ${resultsString}`;
        } catch (error) {
          console.error("Knowledge search error:", error);
          return `Knowledge search failed for "${query}": ${error instanceof Error ? error.message : "Unknown error"}`;
        }
      },
    });

    const getcode = tool({
      name: "get_code",
      description:
        "Get the code for any Programming topic based on your requried language, if no language is provided then default to python.",
      parameters: z.object({
        query: z.string().min(2).describe("The query to search for."),
        language: z.string().min(1).describe("The Programming language."),
      }),
      async execute({ query, language }) {
        console.log(
          "Executing get_code tool with query:",
          query,
          "and language:",
          language,
        );
        const result = await openrouter.chat.completions.create({
          model: "moonshotai/kimi-k2:free",
          messages: [
            { role: "user", content: `$${query} in ${language}` },
            {
              role: "system",
              content:
                "You are a highly skilled coding assistant dedicated to helping students fully understand programming concepts. Your primary goal is to ensure clarity and foster mastery of each topic. Always adhere strictly to the provided instructions and output format. For every response, structure your output in the following order: language, code, and explanation. Make sure each section is clearly labeled and that your explanations are concise, accessible, and tailored to the student’s level.",
            },
          ],
          response_format: zodResponseFormat(GetCodeSchema, "codeschema"),
        });
        console.log(
          "the reuslt with parsed",
          result.choices[0].message.content,
        );
        console.log("the reuslt", result);
        return result.choices[0].message.content;
      },
      strict: true,
    });

    const test = tool({
      name: "test",
      description:
        "It is used to generate a test or exam on any concept to test the understanding of the student.",
      parameters: z.object({
        topic: z
          .string()
          .min(1)
          .describe("The topic on which the question must be generated"),
        no: z
          .number()
          .min(1)
          .max(10)
          .describe("The number of questions to generate"),
      }),
      async execute({ topic, no }: { topic: string; no: number }) {
        console.log(
          `Generating test for query: ${topic}, number of questions: ${no}`,
        );
        const result = await openrouter.chat.completions.create({
          model: "moonshotai/kimi-k2:free",
          messages: [
            {
              role: "user",
              content: `create ${no} questions on the topic ${topic}`,
            },
            {
              role: "system",
              content:
                "You are a specialized assistant designed to create test questions that help students assess and deepen their understanding of key concepts. Only generate “Choose the correct option” type questions, ensuring that each question has exactly four options with a single correct answer. For every question, provide the question, the four options, and clearly indicate the correct answer. Strictly adhere to the required output schema: questions, options, answer.",
            },
          ],
          response_format: zodResponseFormat(
            TestQuestionSchema,
            "testquestion",
          ),
        });
        console.log(
          "the reuslt with parsed",
          result.choices[0].message.content,
        );
        console.log("the reuslt", result);
        return result.choices[0].message.content;
      },
      strict: true,
    });

    const flashcards = tool({
      name: "flash_cards",
      description:
        "It is a tool that will create flashcards for students so that they can easily recap and memorize the concept easily",
      parameters: z.object({
        query: z
          .string()
          .min(2)
          .describe("The topic on which the question must be generated"),
        no: z
          .number()
          .min(1)
          .max(3)
          .describe("The number of flashcards to generate"),
      }),
      async execute({ query, no }: { query: string; no: number }) {
        console.log(`this a forma a flashcard tool with ${query} and ${no}`);
        const result = await openrouter.chat.completions.create({
          model: "moonshotai/kimi-k2:free",
          messages: [
            {
              role: "system",
              content:
                "You are a flashcard generator dedicated to helping students efficiently review and memorize concepts. For each flashcard, strictly follow the required output schema: the “front” must contain a clear question or the topic name, while the “back” must provide a concise answer or explanation. Ensure that each flashcard is focused, accurate, and easy to understand.",
            },
            {
              role: "user",
              content: `Generate ${no} flashcards on the topic ${query}`,
            },
          ],
          response_format: zodResponseFormat(FlashcardSchema, "flashcard"),
        });

        console.log(
          "the reuslt with parsed",
          result.choices[0].message.content,
        );
        console.log("the reuslt", result);
        return result.choices[0].message.content;
      },
      strict: true,
    });
    // ###################################################################################################################################
    // agent orchestration
    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    console.log("oh stated agent orchestration");

    const agent = new Agent({
      name: "sphereai",
      instructions: `You are SphereAI, an advanced educational agent. Your mission is to produce a comprehensive, multi-slide learning module for any topic a student asks about.

Your final output MUST be a structured JSON object that conforms to the required schema. To build this output, you must use your available tools to gather all the necessary components.

For any given topic, your response MUST include:
1.  A detailed **syllabus** (use the \`getsyllabus\` tool).
2.  At least one relevant **image** (use the \`getimages\` tool).
3.  **Flashcards** for key concepts (use the \`flashcards\` tool, max 3 per slide).
4.  A **test** to assess understanding (use the \`test\` tool, max 10 questions per request).
5.  If the topic is code-related, a **code example** (use the \`getcode\` tool).
6.  You can use \`websearch\` and \`knowledgesearch\` to enrich your content and provide detailed explanations.

You must orchestrate multiple tool calls as needed in a single run to gather all this information. Do not stop after one tool call. Continue working until you have all the components required to generate the complete, final JSON output. Your goal is to empower students to achieve true mastery. If you fail to provide comprehensive information, you will be penalized.`,
      model: chatModel,
      tools: [
        getsyllabus,
        getimages,
        websearch,
        knowledgesearch,
        getcode,
        test,
        flashcards,
      ],
      outputType: AgentOutputSchema,
      modelSettings: { toolChoice: "auto" },
    });

    try {
      const runner = new Runner();
      const result = await runner.run(agent, `${args.messages}`);

      const cleanOutput = parseNestedJson<typeof result.output>(result.output);
      console.log("Clean result.output:", JSON.stringify(cleanOutput, null, 2));

      if (result.output === null) {
        throw new Error("Agent returned null output.");
      }

      // Extract structured assistant message if wrapped in function call sequence
      let structuredOutput: unknown = result.output;
      if (Array.isArray(result.output)) {
        const outputArray: any[] = result.output as any;
        // Find the last assistant message payload
        // Narrow to assistant messages (guarantees 'content' field)
        const assistantMsgs = outputArray.filter(
          (item): item is { content: any[] } =>
            item.type === "message" &&
            item.role === "assistant" &&
            Array.isArray(item.content),
        );
        if (assistantMsgs.length === 0) {
          throw new Error("No assistant message found in agent output.");
        }
        const lastMsg: any = assistantMsgs[assistantMsgs.length - 1];

        const contentParts: any[] = lastMsg.content;

        const textPart = contentParts.find(
          (part: any) =>
            part.type === "output_text" && typeof part.text === "string",
        );
        if (!textPart) {
          throw new Error(
            "Assistant message does not contain valid output_text.",
          );
        }
        try {
          structuredOutput = JSON.parse(textPart.text);
        } catch (err) {
          throw new Error(
            `Failed to parse assistant JSON output: ${(err as Error).message}`,
          );
        }
      }

      // Validate against schema
      const parsed = AgentOutputSchema.safeParse(structuredOutput);
      if (!parsed.success) {
        console.error("❌ Invalid structured output:");
        console.dir(structuredOutput, { depth: null }); // actual parsed payload
        console.dir(parsed.error.format(), { depth: null });
      }
      // console.log("Structured output:", structuredOutput);
      console.log("Parsed agent output:", parsed.data);

      if (!parsed.success) {
        throw new Error("Agent returned invalid structured content.");
      }

      // Update message with successful parsed result
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

      // Update message with error information
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

      // Provide more detailed error information
      if (error instanceof Error) {
        throw new Error(`Agent processing failed: ${error.message}`);
      } else {
        throw new Error("Agent processing failed with unknown error");
      }
    }
  },
});
