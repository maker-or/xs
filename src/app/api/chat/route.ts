import { createOpenAI } from '@ai-sdk/openai';
//import Groq from "groq-sdk"; // Ensure this package is installed
import { streamText, smoothStream } from 'ai';
import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedding } from '~/utils/embeddings';
import { type ConvertibleMessage } from '~/utils/types';


// Define a type for the expected request body structure
interface RequestBody {
  messages: ConvertibleMessage[];
}

export async function POST(req: Request): Promise<Response> {
  try {
    // Validate GROQ API key


    console.log('Welcome to AI');

    // Parse the request JSON with explicit typing
    const body = await req.json() as RequestBody;

    // Validate the request body
    if (!body.messages || body.messages.length === 0) {
      throw new Error('No messages provided');
    }

    const lastMessage = body.messages[body.messages.length - 1];
    if (!lastMessage?.content) {
      throw new Error('No valid last message found');
    }

    const query = lastMessage.content;
    console.log('Query:', query);

    // Initialize Pinecone
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? '',
    });

    // Get embeddings for the query
    const queryEmbedding = await getEmbedding(query);
    console.log('Query Embedding:', queryEmbedding);

    // Query Pinecone for relevant context
    const index = pinecone.index('dwm');
    const queryResponse = await index.namespace('').query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    });

    console.log('Pinecone Query Response:', JSON.stringify(queryResponse, null, 2));

    // Validate Pinecone response
    if (!queryResponse.matches || queryResponse.matches.length === 0) {
      throw new Error('No relevant context found in Pinecone');
    }

    // Construct context from Pinecone results
    const context = queryResponse.matches
      .map((match) => `Book: ${String(match.metadata?.book ?? 'Unknown')}\nPage: ${String(match.metadata?.page_number ?? 'Unknown')}\nText: ${String(match.metadata?.text ?? '')}`)
      .join('\n\n');

    console.log('Context:', context);

    // Construct the final prompt for Groq
    const finalPrompt = `
Context: ${context}
Question: ${query}
Please provide a comprehensive and detailed answer to the user's query and cite the book name at the end of the response.
`;

    console.log('Final Prompt:', finalPrompt);

    //const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    // const groq = createGroq({
    //   baseURL: 'https://api.groq.com/openai/v1',
    //   GROQ_API_KEY: process.env.GROQ_API_KEY

    // });


const groq = createOpenAI({
  // custom settings, e.g.
  baseURL:'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY ?? '', // strict mode, enable when using the OpenAI API
});
    // Generate the response using Groq
    try {
      const result = streamText({
          model: groq("llama3-70b-8192"),
      // Use 'key' instead of 'apiKey' for Groq API
        system: `
          You are an expert exam assistant named SphereAI designed to provide accurate, detailed, and structured answers to user queries help them to prepare for their exams. Your task is to answer questions based on the provided context.answer answer genral questions from your own knowledge base . Follow these guidelines:
      
          1. **Role**: Act as a knowledgeable and helpful assistant.
          2. **Task**: Answer user questions clearly and concisely.
          3. **Output Format**:
             - Start with a brief summary of the answer.
             - Use headings and bullet points for clarity.
             - Provide step-by-step explanations where applicable.
             - Keep paragraphs short and easy to read.
             -After each paragraph you write, leave an empty line (a blank line) to improve readability and ensure the text is visually organized.

          4. **Context Handling**:
             - Use the provided context to generate answers.
             - If the context is insufficient, state that you don't have enough information.
          5. **Tone and Style**:
             - Use a professional and friendly tone.
             - Avoid overly technical jargon unless requested.
          6. **Error Handling**:
             - If the query is unclear, ask for clarification before answering.
          7. **Citations**:
             - Always cite the source of your information at the end of your response, if applicable.
          8. **Question Generation**:
             - if the user requests you to generate a question, create only a thought-provoking and contextually appropriate question without providing any answers.
      
          Your goal is to ensure the user receives accurate, well-structured, and helpful answers.
        `,
        prompt: finalPrompt,
        experimental_transform: smoothStream(),
      });
      return result.toDataStreamResponse({
// Removed 'sendReasoning' as it is not a valid property for the response object
      });
    } catch (error) {
      console.error('Error during streamText:', error);
      return new Response(
        JSON.stringify({ error: 'An error occurred while generating the response', details: error instanceof Error ? error.message : 'Unknown error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: unknown) {
    console.error('Error in chat route:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request', details: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
