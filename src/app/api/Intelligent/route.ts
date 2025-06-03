import { createOpenRouter } from '@openrouter/ai-sdk-provider';
// import { getEmbedding } from '~/utils/embeddings';
import { type ConvertibleMessage } from '~/utils/types';
import { streamText } from "ai";
// import { Pinecone } from '@pinecone-database/pinecone';
import { runGeneratedSQLQuery, generateQuery, explainQuery } from '~/app/api/chat/action';

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
    //console.log(query);

    // const apiKey = process.env.PINECONE_API_KEY;

    // if (!apiKey) {
    //   throw new Error("PINECONE_API_KEY is not defined");
    // }

    // const pinecone = new Pinecone({
    //   apiKey: apiKey,
    // });

    // Get embeddings for the query
    // const queryEmbedding = await getEmbedding(query);
    //console.log(queryEmbedding);

    // Query Pinecone
    // const index = pinecone.index('k');
    // const queryResponse = await index.query({
    //   vector: queryEmbedding,
    //   topK: 5,
    //   includeMetadata: true,
    // });

    // console.log(queryResponse);

    // Safely filter and map matches with metadata
    // const context = queryResponse.matches
    //   .filter((match) => match.metadata && typeof match.metadata.content === 'string')
    //   .map((match) => match.metadata!.content as string)
    //   .join('\n\n');

    // console.log(context);

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const model = openrouter('google/gemma-3-27b-it:free');

    // Generate SQL query
    const generatedSQL = await generateQuery(query);
    console.log(generatedSQL)
    const sqlResults = await runGeneratedSQLQuery(generatedSQL);
    const sqlExplanation = await explainQuery(query, generatedSQL);

    const final_prompt = `
   

    User Query: ${query}
    Generated SQL Query: ${generatedSQL}
    SQL Results: ${JSON.stringify(sqlResults)}
    Explanation of SQL Query: ${JSON.stringify(sqlExplanation)}

    Please provide a comprehensive and detailed answer to the user's query.
    `;

    // console.log(context)
    //console.log(query)
    //console.log(final_prompt)

    const result = streamText({
      model: model,
      system: 'Your job is to genrate the answers to the given question make the answer is clean clear in a strucured format',
      prompt: final_prompt,

    });

    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Error in chat route:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred while processing your request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
