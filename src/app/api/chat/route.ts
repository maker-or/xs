import { createOpenAI } from '@ai-sdk/openai';
//import Groq from "groq-sdk"; // Ensure this package is installed
import { streamText, smoothStream ,generateText} from 'ai';
import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedding } from '~/utils/embeddings';
import { type ConvertibleMessage } from '~/utils/types';


// Define a type for the expected request body structure
interface RequestBody {
  messages: ConvertibleMessage[];
  model: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    console.log('Welcome to AI');
    
    const body = await req.json() as RequestBody;
    //console.log("the body is",body)
    const selectedModel = body.model || "llama3-70b-8192";

    if (!body.messages || body.messages.length === 0) {
      throw new Error('No messages provided');
    }

    const lastMessage = body.messages[body.messages.length - 1];
    if (!lastMessage?.content) {
      throw new Error('No valid last message found');
    }

    const query = lastMessage.content;
    console.log('Query:', query);

    // First, let's ask the LLM to decide whether to use RAG or not
    const groq = createOpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY ?? '',
    });

    const decisionPrompt = `
      Analyze this query: "${query}"
      Should I use RAG (retrieval from knowledge base) or answer from general knowledge?
      If the query is related to studies, exams, or educational content, respond with "USE_RAG".
      If it's a general conversation or question, respond with "USE_GENERAL".
      Respond with only one of these two options.
    `;

    const decision = await generateText({
      model: groq('llama-3.3-70b-versatile'),
      prompt: decisionPrompt,
      temperature: 0,
    });

    //console.log("the descioni is",decision)
    
    const a = decision.text;
    console.log("the a is",a)
    const useRag = a.includes("USE_RAG");
    console.log("the useRag is",useRag)
    let finalPrompt = '';

    if (useRag) {
      // Initialize Pinecone and perform RAG
      const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY ?? '',
      });


      const sub = `
You are a query classifier. Your task is to categorize a given query into one of the following subjects and return only the corresponding subject tag. Do not include any other text in your response.

The possible subject categories and their tags are:

*   Compiler Design: cd
*   Data Analysis and Algorithms: daa
*   Data Communication and Networking/CRYPTOGRAPHY AND NETWORK SECURITY: ol
*   Engineering Economics and Management: eem

Analyze the following query: "${query}" and return the appropriate tag.
    `;

    //console.log("the sub is",sub)
      const i = await generateText({
        model: groq('llama-3.3-70b-versatile'),
        prompt: sub,
        temperature: 0,
      });

      //console.log("the i is",i)
      const queryEmbedding = await getEmbedding(query);
      const index = pinecone.index(i.text);
      const queryResponse = await index.namespace('').query({
        vector: queryEmbedding,
        topK: 5,
        includeMetadata: true,
      });

      if (!queryResponse.matches || queryResponse.matches.length === 0) {
        throw new Error('No relevant context found in Pinecone');
      }

      const context = queryResponse.matches
        .map((match) => `Book: ${String(match.metadata?.book ?? 'Unknown')}\nPage: ${String(match.metadata?.page_number ?? 'Unknown')}\nText: ${String(match.metadata?.text ?? '')}`)
        .join('\n\n');

      finalPrompt = `
        Context: ${context}
        Question: ${query}
        Please provide a comprehensive and detailed answer based on the provided context and cite the book name at the end of the response.
      `;
    } else {
      // Use general knowledge
      finalPrompt = `
        Question: ${query}
        keep the response friendly tone and short.`;
    }

    // Generate the response using Groq
    try {
      const result = streamText({
        model: groq(selectedModel),
        system: `
          You are an expert exam assistant named SphereAI designed to provide accurate, detailed, and structured answers to user queries help them to prepare for their exams. Your task is to answer questions based on the provided context . Follow these guidelines:
      
          1. **Role**: Act as a knowledgeable and helpful assistant don't show the thinking process. just provide the answer.
          2. **Task**: Answer user questions indetail and explain it clearly answer each question for 15 marks .
          3. **Output Format**:
             - Start with a indetailed explation of the answer.
             - Use markdown formatting for headings and bullet points.
             - Use bullet points for sub-points.
             - Use headings for sections and sub-headings for sub-points.
             - Use sub-headings for even more detailed explanations.
             - Use paragraphs for detailed explanations.
             write a summary
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
    //    experimental_transform: smoothStream(),
      });

      return result.toDataStreamResponse();
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
