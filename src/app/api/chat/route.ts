import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getEmbedding } from '~/utils/embeddings';
import { type ConvertibleMessage } from '~/utils/types';
import { streamText } from "ai";
import { Pinecone } from '@pinecone-database/pinecone';


// import { Ollama } from "@langchain/ollama";
// import {fetchYouTubeVideos} from'~/app/api/chat/youtube'
// import { runGeneratedSQLQuery, generateQuery, explainQuery } from '~/app/api/chat/action';

// Define a type for the expected request body structure
interface RequestBody {
  messages: ConvertibleMessage[];
}

export async function POST(req: Request): Promise<Response> {
  try {
    console.log("welcome to ai");

    // Parse the request JSON with explicit typing
    const body = await req.json() as RequestBody;

    if (!body.messages || body.messages.length === 0) {
      throw new Error('No messages provided');
    }

    const lastMessage = body.messages[body.messages.length - 1];
    if (!lastMessage?.content) {
      throw new Error('No valid last message found');
    }

    const query = lastMessage.content;
    console.log(query);

    //  const video:unknown = await fetchYouTubeVideos(query);
    //   console.log(video)




    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY ?? "",


    });

    // Get embeddings for the query
    const queryEmbedding = await getEmbedding(query);
    console.log("in route ", queryEmbedding);

    // Query Pinecone
    const index = pinecone.index('dwm');
    const queryResponse = await index.namespace('').query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
      //  includeValues:true
    });


    console.log("Pinecone Query Response:", JSON.stringify(queryResponse, null, 2));
    console.log("*******************")


    const context = queryResponse.matches
      .map((match) => `Book: ${String(match.metadata?.book ?? 'Unknown')}\nPage: ${String(match.metadata?.page_number ?? 'Unknown')}\nText: ${String(match.metadata?.text ?? '')}`)
      .join('\n\n');





    console.log("Tgiz is contexr", context);
    console.log("****************");

    const google = createGoogleGenerativeAI({
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      apiKey: process.env.GEMINI_API_KEY
    });

    const model = google('models/gemini-1.5-flash', {
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ],
    });


    // const llm = new Ollama({
    //   model: "llama3.2", // Default value
    //   temperature: 0,
    //   maxRetries: 2,
    //   // other params...
    // });


    const final_prompt = `
     Context: ${context} and the question is ${query} Please provide a comprehensive and detailed answer to the user's query and Cite the book name at the end of quries.
    `;

    console.log("+++++++++++++++++++++++++++++++++++++++++++++");
    console.log("This is final prompt", final_prompt)
    console.log("+++++++++++++++++++++++++++++++++++++++++++++");
    console.log("thisa is qurey", query)
    console.log("+++++++++++++++++++++++++++++++++++++++++++++");
    console.log("thisa is contttttt", context)

    const result = await streamText({
      model: model,
      system: 'Your job is to genrate the answers to the given question make the answer is clean clear in a strucured format if no context is given the return s0s if no question is provided then return s1s',
      prompt: final_prompt,


    });

    // console.log("This is resukt",result)
    return result.toDataStreamResponse();

  } catch (error: unknown) {
    console.error('Error in chat route:', error instanceof Error ? error.message : 'Unknown error');
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
