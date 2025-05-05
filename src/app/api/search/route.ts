import { DuckDuckGoSearch } from '@langchain/community/tools/duckduckgo_search';
import { groq } from '@ai-sdk/groq';
import { generateText } from 'ai';
import { type ConvertibleMessage } from '../../../../utils/types';
import { NextResponse } from 'next/server';

// Define types for structured search results
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface FormattedSearchResponse {
  results: string;
  metadata: {
    sources: SearchResult[];
    query: string;
    timestamp: string;
  };
}

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

    // Add explicit check to ensure query is not empty
    if (!query) {
      return NextResponse.json(
        { error: 'No query to search' },
        { status: 400 }
      );
    }

    const searchTool = new DuckDuckGoSearch();
    try {
      const searchResults = (await searchTool.invoke(query)) as string;
      
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
      console.log("the web result is: ", searchResults)
      console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")

      // Extract structured data from search results
      const sources: SearchResult[] = extractSourcesFromResults(searchResults);

      try {
        const result = await generateText({
          model: groq('llama-3.3-70b-specdec'),
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
4. Source References
When citing specific information, use numbered references like [1], [2], etc. that correspond to the sources provided.

      `,
          prompt: `Summarize search results for: ${query}\n\nResults:\n${searchResults}`,
        });

        // Create formatted response with metadata
        const responseData: FormattedSearchResponse = { 
          results: result.text,
          metadata: {
            sources: sources,
            query: query,
            timestamp: new Date().toISOString()
          }
        };

        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        console.log("response is: ", responseData)
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        
        return NextResponse.json(responseData);
      } catch (error) {
        console.error('Error during streamText:', error);
        return NextResponse.json(
          { error: 'An error occurred while generating the response', details: error instanceof Error ? error.message : 'Unknown error' },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error during search operation:', error);
      return NextResponse.json(
        { error: 'An error occurred while performing the search', details: error instanceof Error ? error.message : 'Unknown error' },
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

/**
 * Extracts structured source information from raw search results
 * @param rawResults - The raw search results string
 * @returns Array of SearchResult objects
 */
function extractSourcesFromResults(rawResults: string): SearchResult[] {
  const sources: SearchResult[] = [];
  
  try {
    // Simple regex-based extraction for title, URL, and snippets
    // Format typically follows: Title (URL) - Snippet
    const resultRegex = /([^\n(]+)\s*\(([^)]+)\)\s*-\s*([^\n]+)/g;
    let match;
    
    while ((match = resultRegex.exec(rawResults)) !== null) {
      if (match.length >= 4) {
        sources.push({
          title: match[1].trim(),
          url: match[2].trim(),
          snippet: match[3].trim()
        });
      }
    }
    
    // Fallback for URLs if the above pattern doesn't match
    if (sources.length === 0) {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      let urlMatch;
      let index = 0;
      
      while ((urlMatch = urlRegex.exec(rawResults)) !== null) {
        sources.push({
          title: `Source ${index + 1}`,
          url: urlMatch[1],
          snippet: extractSnippetAroundUrl(rawResults, urlMatch[1], 100)
        });
        index++;
      }
    }
    
    return sources;
  } catch (error) {
    console.error("Error extracting sources:", error);
    return [];
  }
}

/**
 * Extracts text around a URL to use as a snippet
 */
function extractSnippetAroundUrl(text: string, url: string, charRange: number): string {
  try {
    const urlIndex = text.indexOf(url);
    if (urlIndex >= 0) {
      const start = Math.max(0, urlIndex - charRange);
      const end = Math.min(text.length, urlIndex + url.length + charRange);
      let snippet = text.substring(start, end).replace(url, '');
      
      // Clean up the snippet
      snippet = snippet
        .replace(/\s+/g, ' ')
        .trim();
      
      return snippet || "No preview available";
    }
    return "No preview available";
  } catch (error) {
    console.log(error)
    return "No preview available";
  }
}