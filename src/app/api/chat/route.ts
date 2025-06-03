import { streamText, generateText } from 'ai';
import { PostHog } from "posthog-node";
import { auth } from "@clerk/nextjs/server";
import { createOpenAI } from "@ai-sdk/openai"
import { withTracing } from "@posthog/ai"
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedding } from '~/utils/embeddings';
import { type ConvertibleMessage } from '~/utils/types';
import { getSystemInstructions } from '~/utils/systemPrompts';
import { v4 as uuidv4 } from 'uuid';

// Response timeout in milliseconds
const RESPONSE_TIMEOUT = 45000; // Reduced from 60s to 45s
const API_TIMEOUT = 8000; // Reduced from 10s to 8s for individual API calls
const EMBEDDING_TIMEOUT = 6000; // Reduced embedding timeout
const PINECONE_TIMEOUT = 12000; // Reduced Pinecone timeout

// Cache for frequently used objects
let cachedPineconeClient: Pinecone | null = null;
let cachedOpenRouterClient: ReturnType<typeof createOpenAI> | null = null;

// Define a type for the expected request body structure
interface RequestBody {
  messages: ConvertibleMessage[];
  model: string;
}

// Helper function to get or create Pinecone client
function getPineconeClient(): Pinecone {
  if (!cachedPineconeClient) {
    cachedPineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return cachedPineconeClient;
}

// Helper function to get or create OpenRouter client
function getOpenRouterClient(): ReturnType<typeof createOpenAI> {
  if (!cachedOpenRouterClient) {
    cachedOpenRouterClient = createOpenAI({
      apiKey: process.env.OPENROUTE_API_KEY!,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }
  return cachedOpenRouterClient;
}

// Optimized timeout wrapper
const withTimeout = <T>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
  const timeoutPromise = new Promise<T>((_, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(message)), ms);
    return timeoutId;
  });
  return Promise.race([promise, timeoutPromise]);
};

// Early validation function
function validateRequest(body: RequestBody): string | null {
  if (!body.messages || body.messages.length === 0) {
    return 'No messages provided';
  }
  
  const lastMessage = body.messages[body.messages.length - 1];
  if (!lastMessage?.content) {
    return 'No valid last message found';
  }
  
  return null;
}

// Optimized decision making with caching potential
async function makeRagDecision(query: string, openrouter: ReturnType<typeof createOpenAI>, userId: string, traceId: string, phClient: PostHog): Promise<boolean> {
  // Simple keyword-based pre-filtering to avoid API calls for obvious cases
  const generalKeywords = ['calculate', 'solve', 'formula', 'equation', 'compute', 'math', 'physics', 'chemistry', 'biology'];
  const hasGeneralKeywords = generalKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
  
  if (hasGeneralKeywords) {
    console.log("Quick decision: Using general knowledge based on keywords");
    return false;
  }

  const studyKeywords = ['study', 'exam', 'theory', 'concept', 'definition', 'explain', 'what is', 'how does'];
  const hasStudyKeywords = studyKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
  
  if (hasStudyKeywords) {
    console.log("Quick decision: Using RAG based on keywords");
    return true;
  }

  // Fallback to LLM decision for ambiguous cases
  const decisionPrompt = `
    Analyze this query: "${query}"
    Should I use RAG (retrieval from knowledge base) or answer from general knowledge?
    If the query is related to studies, exams, or educational content only theory question respond with "USE_RAG".
    If it's a general conversation or question, or a problem or numerical related to math,physics,chemistry or biology respond with "USE_GENERAL".
    Respond with only one of these two options.
  `;

  try {
    const decisionModel = withTracing(
      openrouter('google/gemma-3-27b-it:free'),
      phClient,
      {
        posthogDistinctId: userId,
        posthogTraceId: traceId,
        posthogProperties: {
          step: 'decision',
          query_type: 'rag_decision',
          conversation_id: traceId
        },
        posthogPrivacyMode: false
      }
    );

    const decision = await withTimeout(
      generateText({
        model: decisionModel,
        prompt: decisionPrompt,
        temperature: 0,
      }),
      API_TIMEOUT,
      "Decision model API call timed out"
    );

    return decision.text.includes("USE_RAG");
  } catch (error) {
    console.error("Error in decision step:", error);
    // Default to general knowledge on error
    return false;
  }
}

// Optimized subject classification with fallback
async function classifySubject(query: string, openrouter: ReturnType<typeof createOpenAI>, userId: string, traceId: string, phClient: PostHog): Promise<string> {
  // Quick classification based on keywords
  const subjectKeywords: Record<string, string[]> = {
    'cd': ['compiler', 'parsing', 'lexical', 'syntax', 'semantic'],
    'daa': ['algorithm', 'data structure', 'complexity', 'sorting', 'searching'],
    'ol': ['network', 'protocol', 'tcp', 'ip', 'security', 'cryptography'],
    'eem': ['economics', 'management', 'finance', 'business', 'cost'],
    'chemistry': ['chemical', 'reaction', 'molecule', 'atom', 'compound']
  };

  const queryLower = query.toLowerCase();
  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    if (keywords.some(keyword => queryLower.includes(keyword))) {
      console.log(`Quick subject classification: ${subject}`);
      return subject;
    }
  }

  // Fallback to LLM classification
  const classificationPrompt = `
You are a query classifier. Your task is to categorize a given query into one of the following subjects and return only the corresponding subject tag. Do not include any other text,symbols or information in your response even the new line.
The possible subject categories and their tags are:
*   Compiler Design: cd
*   Data Analysis and Algorithms: daa
*   Data Communication and Networking/CRYPTOGRAPHY AND NETWORK SECURITY: ol
*   Engineering Economics and Management: eem
*   Chemistry : chemistry
Analyze the following query: "${query}" and return the appropriate tag.
  `;

  try {
    const subjectModel = withTracing(
      openrouter('google/gemma-3-27b-it:free'),
      phClient,
      {
        posthogDistinctId: userId,
        posthogTraceId: traceId,
        posthogProperties: {
          step: 'subject_classification',
          query_type: 'rag_subject',
          conversation_id: traceId
        },
        posthogPrivacyMode: false
      }
    );

    const result = await withTimeout(
      generateText({
        model: subjectModel,
        prompt: classificationPrompt,
        temperature: 0,
      }),
      API_TIMEOUT,
      "Subject classification timed out"
    );

    return result.text.trim() || 'daa';
  } catch (error) {
    console.error("Error in subject classification:", error);
    return 'daa'; // Default fallback
  }
}

// Optimized RAG processing
async function processRAG(query: string, openrouter: ReturnType<typeof createOpenAI>, userId: string, traceId: string, phClient: PostHog): Promise<string> {
  try {
    // Parallel execution of subject classification and embedding generation
    const [subjectResult, queryEmbedding] = await Promise.all([
      classifySubject(query, openrouter, userId, traceId, phClient),
      withTimeout(
        getEmbedding(query),
        EMBEDDING_TIMEOUT,
        "Embedding generation timed out"
      ).catch(error => {
        console.error("Embedding error:", error);
        throw error;
      })
    ]);

    // Query Pinecone
    const pinecone = getPineconeClient();
    const index = pinecone.index(subjectResult);
    
    const queryResponse = await withTimeout(
      index.namespace('').query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
      }),
      PINECONE_TIMEOUT,
      "Pinecone query timed out"
    );

    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      console.log("No matches found in Pinecone");
      return '';
    }

    const context = queryResponse.matches
      .map((match) => `Book: ${String(match.metadata?.book ?? 'Unknown')}\nPage: ${String(match.metadata?.page_number ?? 'Unknown')}\nText: ${String(match.metadata?.text ?? '')}`)
      .join('\n\n');

    return context;
  } catch (error) {
    console.error("Error in RAG process:", error);
    return '';
  }
}

export async function POST(req: Request): Promise<Response> {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort('Request timeout');
  }, RESPONSE_TIMEOUT);

  // Initialize PostHog client
  const phClient = new PostHog(
    'phc_sjPTqJzPZW9FgJls2UBHfwjUHP4UCFIOEifTkyUDdZA',
    { host: 'https://us.i.posthog.com' }
  );

  let body: RequestBody;
  let userId: string;
  const traceId = uuidv4();

  try {
    // Early validation of environment variables
    if (!process.env.GROQ_API_KEY || !process.env.OPENROUTE_API_KEY || !process.env.PINECONE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error - missing API keys' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parallel execution of auth and request parsing
    const [authResult, bodyResult] = await Promise.all([
      auth().catch(() => ({ userId: 'anonymous' })),
      req.json().catch(() => null)
    ]);

    userId = (authResult as { userId: string }).userId;
    
    if (!bodyResult) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    body = bodyResult as RequestBody;

    // Early validation
    const validationError = validateRequest(body);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const query = body.messages[body.messages.length - 1]?.content || '';
    console.log('Query:', query);

    // Optimized conversation context (only last 3 messages instead of 5)
    const lastMessages = body.messages.slice(Math.max(0, body.messages.length - 1), -1);
    const conversationContext = lastMessages.length > 0
      ? `Previous conversation:\n${lastMessages.map(msg => msg.content).join('\n\n')}\n`
      : '';

    const openrouter = getOpenRouterClient();

    const useRag = await makeRagDecision(query, openrouter, userId, traceId, phClient);
    console.log("Using RAG:", useRag);

    let finalPrompt = '';

    if (useRag) {
      const context = await processRAG(query, openrouter, userId, traceId, phClient);
      
      if (context) {
        finalPrompt = `
          ${conversationContext}
          Context: ${context}
          Question: ${query}
          Please provide a comprehensive and detailed answer based on the provided context and cite the book name at the end of the response.
        `;
      } else {
        finalPrompt = `
          ${conversationContext}
          Question: ${query}
          Keep the response friendly tone and short
        `;
      }
    } else {
      finalPrompt = `
        ${conversationContext}
        Question: ${query}
        Keep the response friendly tone and short
      `;
    }

    // Generate response
    const model = withTracing(openrouter('google/gemini-2.0-flash-exp:free'), phClient, {
      posthogDistinctId: userId,
      posthogTraceId: traceId,
      posthogProperties: {
        step: 'main_generation',
        query_type: useRag ? 'rag_response' : 'general_response',
        conversation_id: traceId,
        model_selected: 'google/gemini-2.0-flash-exp:free',
        rag_enabled: useRag,
        conversation_length: body.messages.length
      },
      posthogPrivacyMode: false,
    });

    // const result = streamText({
    //   model: model,
    //   system: getSystemInstructions(),
    //   prompt: finalPrompt,
    // });


const result = streamText({
  model: model,
  messages: [
    {
      role: 'system',
      content: getSystemInstructions(),
      experimental_providerMetadata: {
        openrouter: {
          cacheControl: { type: 'ephemeral' },
        },
      },
    },
    { 
      role: 'user', 
      content: finalPrompt 
    },
  ],
});

    clearTimeout(timeoutId);
    await phClient.flush();

    return result.toDataStreamResponse();

  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.error('Error in chat route:', error);

    // Enhanced error handling with fallback streaming response
    const encoder = new TextEncoder();
    let fallbackMessage = "I'm sorry, an unexpected error occurred. Please try again.";

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('Rate limit') || error.message.includes('429')) {
        fallbackMessage = "You've reached your free usage limit. Please try again tomorrow.";
      } else if (error.message.includes('timeout')) {
        fallbackMessage = "The request timed out. Please try again with a simpler question.";
      }
    }

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackMessage })}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });

    try {
      await phClient.flush();
    } catch (phError) {
      console.error('Error flushing PostHog:', phError);
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  }
} 