// import { createOpenAI } from '@ai-sdk/openai';
//import Groq from "groq-sdk"; // Ensure this package is installed
import { groq } from '@ai-sdk/groq';
import { streamText, generateText } from 'ai';
import { PostHog } from "posthog-node";
// import { OpenAI } from '@posthog/ai'
import { createOpenAI } from "@ai-sdk/openai"
import { withTracing } from "@posthog/ai"
// import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedding } from '~/utils/embeddings';
import { type ConvertibleMessage } from '~/utils/types';
import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';
import { getSystemInstructions } from '~/utils/systemPrompts';

// Response timeout in milliseconds (15 seconds)
const RESPONSE_TIMEOUT = 60000;

// Define a type for the expected request body structure
interface RequestBody {
  messages: ConvertibleMessage[];
  model: string;
  experimental_attachments?: string[];
  voiceMode?: boolean; // Flag to indicate if this is a voice interaction
}

export async function POST(req: Request): Promise<Response> {
  // Create an AbortController for timeout management
  const abortController = new AbortController();
  // const { signal } = abortController;

  // Set a timeout to prevent hanging requests
  const timeoutId = setTimeout(() => {
    abortController.abort('Request timeout');
  }, RESPONSE_TIMEOUT);


  const phClient = new PostHog(
    'phc_sjPTqJzPZW9FgJls2UBHfwjUHP4UCFIOEifTkyUDdZA',
    { host: 'https://us.i.posthog.com' }
  );


  try {
    console.log('Welcome to AI');

    // Check if environment variables are properly set
    if (!process.env.GROQ_API_KEY || !process.env.OPENROUTE_API_KEY || !process.env.PINECONE_API_KEY) {
      console.error('Missing required API keys in environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error - missing API keys' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    let body: RequestBody;
    try {
      body = await req.json() as RequestBody;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: 'Failed to parse JSON' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log("Request body received:", JSON.stringify(body).substring(0, 200) + "...");
    const selectedModel = body.model || "deepseek/deepseek-chat-v3-0324:free";
    const isVoiceMode = body.voiceMode || false;

    // Input validation
    if (!body.messages || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No messages provided' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const lastMessage = body.messages[body.messages.length - 1];
    if (!lastMessage?.content) {
      return new Response(
        JSON.stringify({ error: 'No valid last message found' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const query = lastMessage.content;
    console.log('Query:', query);

    // NEW: Compute conversation context from previous messages, if any
    const last10Messages = body.messages.slice(Math.max(0, body.messages.length - 10), -1);
    const conversationContext = last10Messages.length > 0
      ? `Previous conversation:\n${last10Messages.map(msg => msg.content).join('\n\n')}\n`
      : '';

    // NEW: Check for attachments
    const attachments = body.experimental_attachments || [];
    if (attachments.length > 0) {
      // Process the attachments
      attachments.forEach((attachment) => {
        console.log("yes it exists");
        console.log('Attachment:', attachment);
      });
    } else {
      console.log("no attachments found");
    }

    // Create OpenRouter client
    const openrouter = createOpenAI({
      apiKey: process.env.OPENROUTE_API_KEY,


    });



    // const openaiClient = createOpenAI({
    //   apiKey: process.env.OPENROUTE_API_KEY,
    //   compatibility: 'strict'
    // });


    // Wrap all API calls in a Promise.race with a timeout promise
    const withTimeout = <T>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
      const timeoutPromise = new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error(message)), ms);
      });
      return Promise.race([promise, timeoutPromise]);
    };

    try {
      console.log("Testing API connections...");

      // First, let's ask the LLM to decide whether to use RAG or not
      const decisionPrompt = `
        Analyze this query: "${query}"
        Should I use RAG (retrieval from knowledge base) or answer from general knowledge?
        If the query is related to studies, exams, or educational content only theroy question respond with "USE_RAG".
        If it's a general conversation or question, or a problem or numerical related to math,physics,chemistry or biology respond with "USE_GENERAL".
        Respond with only one of these two options.
      `;

      let decision;
      try {
        decision = await withTimeout(
          generateText({
            model: openrouter('meta-llama/llama-3.3-70b-instruct:free') || groq('qwen-qwq-32b'),
            prompt: decisionPrompt,
            temperature: 0,
          }),
          10000, // 10 second timeout
          "Decision model API call timed out"
        );
        console.log("Decision prompt completed successfully");
      } catch (decisionError) {
        console.error("Error in decision step:", decisionError);
        // Fallback to general knowledge if the decision API call fails
        decision = { text: "USE_GENERAL" };
      }

      const a = decision.text;
      console.log("Decision result:", a);
      const useRag = a.includes("USE_RAG");
      console.log("Using RAG:", useRag);

      let finalPrompt = '';

      if (useRag) {
        try {
          // Initialize Pinecone and perform RAG
          const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
          });

          // Get subject classification
          const sub = `
You are a query classifier. Your task is to categorize a given query into one of the following subjects and return only the corresponding subject tag. Do not include any other text,symbols or information in your response even the new line.
The possible subject categories and their tags are:
*   Compiler Design: cd
*   Data Analysis and Algorithms: daa
*   Data Communication and Networking/CRYPTOGRAPHY AND NETWORK SECURITY: ol
*   Engineering Economics and Management: eem
*   Chemistry : chemistry
Analyze the following query: "${query}" and return the appropriate tag.
          `;

          let subjectResult;
          try {
            subjectResult = await withTimeout(
              generateText({
                model: groq('meta-llama/llama-4-scout-17b-16e-instruct'),
                prompt: sub,
                temperature: 0,
              }),
              10000, // 10 second timeout
              "Subject classification timed out"
            );
            console.log("Subject classification result:", subjectResult.text);
          } catch (subjectError) {
            console.error("Error in subject classification:", subjectError);
            // Default to a general subject if classification fails
            subjectResult = { text: "daa" }; // Default to data analysis as fallback
          }

          // Create embedding
          let queryEmbedding;
          try {
            queryEmbedding = await withTimeout(
              getEmbedding(query),
              10000, // 10 second timeout
              "Embedding generation timed out"
            );
          } catch (embeddingError) {
            console.error("Error generating embedding:", embeddingError);
            // Fall back to general knowledge if embedding fails
            throw new Error("Failed to generate embedding");
          }

          // Query Pinecone
          try {
            const index = pinecone.index(subjectResult.text);
            const queryResponse = await withTimeout(
              index.namespace('').query({
                vector: queryEmbedding,
                topK: 5,
                includeMetadata: true,
              }),
              10000, // 10 second timeout
              "Pinecone query timed out"
            );

            // Query web for additional context
            let searchResults = "";
            try {
              const searchTool = new DuckDuckGoSearch();
              searchResults = await withTimeout(
                searchTool.invoke(query) as Promise<string>,
                10000, // 10 second timeout
                "Web search timed out"
              );
              console.log("^^^^^^^^^^^^^^");
              console.log(searchResults);
              console.log("^^^^^^^^^^^^^^");
            } catch (searchError) {
              console.error("Error in web search:", searchError);
              searchResults = "No additional web context available.";
            }

            if (!queryResponse.matches || queryResponse.matches.length === 0) {
              console.log("No matches found in Pinecone, falling back to general knowledge");
              finalPrompt = `
                ${conversationContext}
                Question: ${query}
                Web Context: ${searchResults}
                Keep the response friendly tone and short
                ${isVoiceMode ? 'Since the user is in voice mode, make your response concise and natural for speech.' : ''}
              `;
            } else {
              const context = queryResponse.matches
                .map((match) => `Book: ${String(match.metadata?.book ?? 'Unknown')}\nPage: ${String(match.metadata?.page_number ?? 'Unknown')}\nText: ${String(match.metadata?.text ?? '')}`)
                .join('\n\n');

              finalPrompt = `
                ${conversationContext}
                Context: ${context}
                Web Context: ${searchResults}
                Question: ${query}
                Please provide a comprehensive and detailed answer based on the provided context and cite the book name at the end of the response.
                ${isVoiceMode ? 'Since the user is in voice mode, make your response concise and natural for speech.' : ''}
              `;
            }
          } catch (pineconeError) {
            console.error("Pinecone error:", pineconeError);
            finalPrompt = `
              ${conversationContext}
              Question: ${query}
              keep the response friendly tone and short
              ${isVoiceMode ? 'Since the user is in voice mode, make your response concise and natural for speech.' : ''}
            `;
          }
        } catch (ragError) {
          console.error("Error in RAG process:", ragError);
          // Fall back to general knowledge approach
          finalPrompt = `
            ${conversationContext}
            Question: ${query}
            keep the response friendly tone and short
            ${isVoiceMode ? 'Since the user is in voice mode, make your response concise and natural for speech.' : ''}
          `;
        }
      } else {
        // Use general knowledge
        finalPrompt = `
          ${conversationContext}
          Question: ${query}
          keep the response friendly tone and short
          ${isVoiceMode ? 'Since the user is in voice mode, make your response concise and natural for speech.' : ''}
        `;
      }

      const models = openrouter(selectedModel) || groq(selectedModel);

      const model = withTracing(models, phClient, {
        posthogDistinctId: "user_123", // optional
        posthogPrivacyMode: false, // optional

      });

      // Generate the response using OpenRouter
      try {
        console.log("Generating final response with model:", selectedModel);

        // Create a TextEncoder for fallback response
        const encoder = new TextEncoder();

        try {
          const result = streamText({
            model: model,
            system: getSystemInstructions(),
            prompt: finalPrompt,

          });

          clearTimeout(timeoutId);
          // console.log("the answer your getiing^^^^^",result.toDataStreamResponse) 
          // console.log("the result is",result);
          return result.toDataStreamResponse();

        } catch (streamError: unknown) {
          console.error('Error during streamText:', streamError);

          // Check for rate limit / credit errors
          const isRateLimitError =
            // Check error cause with rate limit message
            (streamError instanceof Error &&
              streamError.cause &&
              typeof streamError.cause === 'object' &&
              'message' in streamError.cause &&
              typeof (streamError.cause as { message: string }).message === 'string' &&
              ((streamError.cause as { message: string }).message.includes('Rate limit exceeded') ||
                (streamError.cause as { message: string }).message.includes('credits'))) ||
            // Check error message directly  
            (streamError instanceof Error &&
              streamError.message &&
              (streamError.message.includes('Rate limit exceeded') ||
                streamError.message.includes('429')));

          // Provide a simple readable stream as fallback
          if (isRateLimitError) {
            // Credit limit error - return special message
            const creditLimitMessage = "You've reached your free usage limit for AI models today. Please try again tomorrow or switch to a different model.";
            const stream = new ReadableStream({
              start(controller) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  error: "CREDIT_LIMIT_EXCEEDED",
                  text: creditLimitMessage
                })}\n\n`));
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              }
            });

            return new Response(stream, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
              }
            });
          } else if (
            (streamError instanceof Error && streamError.name === 'AbortError') ||
            (streamError instanceof Error && streamError.message?.includes('timeout'))
          ) {
            // If it's a timeout or abort error, return a fallback streaming response
            const fallbackMessage = "I'm sorry, but my response is taking longer than expected to generate. Please try again with a simpler question or try again later.";
            const stream = new ReadableStream({
              start(controller) {
                // Format as an SSE data message for compatibility
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackMessage })}\n\n`));
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              }
            });

            return new Response(stream, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
              }
            });
          }

          // For other errors, return a JSON error
          return new Response(
            JSON.stringify({
              error: 'An error occurred while generating the response',
              details: streamError instanceof Error ? streamError.message : 'Unknown error'
            }),
            {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }
      } catch (finalError) {
        console.error('Error in response generation:', finalError);
        return new Response(
          JSON.stringify({
            error: 'Failed to generate response',
            details: finalError instanceof Error ? finalError.message : 'Unknown error'
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    } catch (apiTestError) {
      console.error('API connection test failed:', apiTestError);

      // Create a simple fallback response
      const encoder = new TextEncoder();
      const fallbackMessage = "I'm sorry, I couldn't connect to the AI services at this time. Please try again later.";

      // Return as a streaming response for better compatibility with client-side code
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackMessage })}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }
  } catch (error: unknown) {
    console.error('Error in chat route:', error instanceof Error ? error.message : 'Unknown error');

    // Clear the timeout to prevent memory leaks
    clearTimeout(timeoutId);

    // Simple fallback for catastrophic errors
    const encoder = new TextEncoder();
    const fallbackMessage = "I'm sorry, an unexpected error occurred. Please try again.";

    // Return as a streaming response for better compatibility
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackMessage })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  }
}
