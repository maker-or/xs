import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { type ConvertibleMessage } from '~/utils/types';
import { NextResponse } from 'next/server';

export async function POST(req: Request): Promise<Response> {
  try {
    // Parse the request JSON with explicit typing
    interface RequestBody {
      messages: ConvertibleMessage[];
    }

    const body = await req.json() as RequestBody;

    // Validate the request body
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'No valid messages found' },
        { status: 400 }
      );
    }

    // Get the last message
    const lastMessage = body.messages[body.messages.length - 1];
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    console.log("last message is: ", lastMessage)
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    if (!lastMessage?.content?.trim()) {
      return NextResponse.json(
        { error: 'No valid message content found' },
        { status: 400 }
      );
    }

    const query = lastMessage.content.trim();
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    console.log('Query in the web search is:', query);
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")

    const searchTool = new DuckDuckGoSearch();
    const searchResults = (await searchTool.invoke(query)) as string;

    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
    console.log("the web result is: ", searchResults)
    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")

    try {
      const result = await generateText({
        model: groq('llama3-70b-8192'),
        system: `
System Prompt: Web Search Summarization Expert
You are an expert assistant specializing in summarizing web search results. Your goal is to provide users with the most relevant, accurate, and structured information from the web. Follow these principles:

1. Detailed Explanation
Provide a well-structured and comprehensive summary of search results.
Extract key insights while maintaining clarity and relevance.
If applicable, include context, background information, and implications.
2. Focus on Relevance
Prioritize the most authoritative and up-to-date sources.
Eliminate redundant, vague, or low-quality information.
Summarize only the most critical aspects based on the user's intent.
3. Clear and Structured Presentation
Use headings, bullet points, and formatting for readability.
Present information in a logical order (e.g., general overview → details → implications).
If multiple perspectives exist, highlight them fairly.

      `,
        prompt: `Summarize search results for: ${query}\n\nResults:\n${searchResults}`,
        //experimental_transform: smoothStream(),
      });

      // Ensure the result is properly formatted as JSON
      const responseData: { results: string } = { results: result.text };
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
      console.log("respond is: ", responseData)
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
      // Assuming result is already in the desired format
      return NextResponse.json(responseData);

    } catch (error) {
      console.error('Error during streamText:', error);
      return NextResponse.json(
        { error: 'An error occurred while generating the response', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error in search route:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}