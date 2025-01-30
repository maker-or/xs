'use client';
import ReactMarkdown from 'react-markdown';

import { useChat } from 'ai/react';
import { Copy, Check, MoveUpRight, Square, Globe, Play } from 'lucide-react';
import { useEffect, useState, useRef } from "react";
import { marked } from "marked"; // Importing the marked library


export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>(''); // Store the last query
interface SearchResponse {
results: string;
}
const [searchResults, setSearchResults] = useState<string | null>(null); // Store search results

const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: '/api/chat',
    onResponse: (_response) => {
      setIsLoading(false);
      resetInputField(); // Reset the input field after the response is received
    },
    onError: (error) => {
      console.error('Error:', error);
      setIsLoading(false);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200 // Max height in pixels
      )}px`;
    }
  };

  const resetInputField = () => {
    // Clear the input field
    setInput('');

    // Reset the height of the textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const copyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };




  // Configure marked with custom renderer and options
  marked.setOptions({
    gfm: true, // Use GitHub Flavored Markdown
    breaks: true, // Convert single newlines to <br>

  });

  // const renderMarkdown = (content: string) => {
  //   // Add extra newlines for better paragraph spacing
  //   const modifiedContent = content
  //     .replace(/\n\n/g, '\n\n\n') // Add extra spacing for paragraphs
  //     .replace(/\n/g, '  \n'); // Ensure single newlines create line breaks

  //   // Render the modified content using marked
  //   return { __html: marked.parse(modifiedContent) };
  // };

  // Extract links from the content
  const extractLinks = (content: string): string[] => {
    const linkRegex = /https?:\/\/[^\s]+/g;
    return content.match(linkRegex) ?? [];
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);

    // Clear search results
    setSearchResults(null);

    // Store the last query
    setLastQuery(input);

    try {
    handleSubmit(event);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsLoading(false);
    }
  };

  // Handle textarea keydown events
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default behavior (new line)
    void onSubmit(event); // Submit the form
    } else if (event.key === 'Enter' && event.shiftKey) {
      // Allow new line when Shift + Enter is pressed
      adjustTextareaHeight(); // Adjust textarea height dynamically
    }
  };

  // Handle "Search Web" button click
  const handleSearchWeb = async () => {
    if (!lastQuery.trim()) {
      console.error('No query to search');
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: lastQuery,
            },
          ],
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Search failed: HTTP status ${response.status}`);
      }
  
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error during web search:', error);
      setSearchResults('Failed to fetch search results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchYouTube = (query: string) => {
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <main className="flex h-[100svh] w-[100svw] flex-col bg-[#0c0c0c] items-center justify-center text-[#0c0c0c]">

      <div className="flex h-full w-2/3  overflow-hidden gap-4 ">
        <div className="flex flex-col h-full w-full "> 
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {messages.map((m, index) => {
              const links = extractLinks(m.content); // Extract links from the message content

              return (
                <div
                  key={m.id}
                  className={`flex flex-col gap-4 mb-6 animate-slide-in group relative`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {m.role === 'user' ? (
                    <div className="max-w-xl text-[2.2em] text-[#E8E8E6] tracking-tight p-4">
                      <article className="whitespace-pre-wrap">
                        <ReactMarkdown>
                          {m.content}
                        </ReactMarkdown>
                      </article>
                    </div>
                  ) : (
                    <div className="max-w-2xl text-[1.2rem] tracking-tight text-[#E8E8E6] rounded-xl p-4 relative">
                      
                      <ReactMarkdown>
                        {m.content}
                      </ReactMarkdown>

                      <div /> 
                      <button
                        onClick={() => copyMessage(m.content, m.id)}
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#f7eee3] hover:text-[#FF5E00]"
                      >
                        {copiedMessageId === m.id ? (
                          <Check className="h-5 w-5 text-green-400" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                      <div className="flex gap-2 mt-2">
                        <div className='flex items-center justify-center bg-[#4544449d] text-white px-2 rounded-full  hover:bg-blue-500'>
                          <button
                            onClick={handleSearchWeb} // Use the stored lastQuery
                            className=" flex-col px-4 py-2   text-white rounded-lg">
                            Web
                          </button>
                          <Globe />
                        </div>

                        <div className='flex items-center justify-center bg-[#4544449d] text-white px-2 rounded-full hover:bg-blue-500'>
                          <button
                            onClick={() => handleSearchYouTube(lastQuery)}
                            className="px-1 py-1  text-white rounded-lg "
                          >
                            YouTube
                          </button>
                          <Play />
                        </div>
                      </div>

                      {/* Links Section */}
                      {links.length > 0 && (
                        <div className="mt-4 group">
                          <div className="text-sm text-[#0c0c0c87] hover:text-[#0c0c0c] cursor-pointer">
                            🔗 {links.length} link(s)
                          </div>
                          <div className="hidden group-hover:block bg-[#f7eee3] p-2 rounded-lg border border-[#e0d5c8] mt-2">
                            {links.map((link, index) => (
                              <div key={index} className="text-sm text-[#0c0c0c87] hover:text-[#0c0c0c]">
                                <a href={link} target="_blank" rel="noopener noreferrer">
                                  {link}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Search Results Section */}
            {searchResults && (
              <div className="mt-6 p-4 bg-[#e0d5c8] rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Search Results</h3>
                <div>
                <ReactMarkdown>
                        {searchResults}
                </ReactMarkdown>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="flex sticky bottom-0 z-10 items-center p-3 justify-center ">
            <form onSubmit={onSubmit} className="flex w-full items-center justify-center">
              <div
                className={`relative flex items-center justify-center bg-[#252525] p-1 border-[1px] border-[#f7eee332] w-3/4 ${textareaRef.current && textareaRef.current.value.split('\n').length > 1
                  ? 'rounded-lg' // Medium radius for multi-line input
                  : 'rounded-full' // Full radius for single-line input
                  }`}
              >
                <textarea
                  ref={textareaRef}
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => {
                    handleInputChange(e);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={handleKeyDown} // Handle keydown events
                  onInput={adjustTextareaHeight}
                  className={`flex-grow w-3/4 h-full outline-none items-center justify-center bg-[#454444] py-4 px-4 text-[#f7eee3] resize-none overflow-y-auto placeholder-[#f7eee3bb] ${textareaRef.current && textareaRef.current.value.split('\n').length > 1
                    ? 'rounded-lg' // Medium radius for multi-line input
                    : 'rounded-full' // Full radius for single-line input
                    }`}
                  style={{ maxHeight: '200px' }} // Set a max height for the textarea
                  rows={1}
                />
                <button
                  type="submit"

                  className="ml-4 p-3 rounded-full bg-[#FF5E00] text-[#f7eee3] font-semibold transition-colors duration-200 hover:bg-[#e05500] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Square fill='#f7eee3'/> : <MoveUpRight />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </main>
  );
}