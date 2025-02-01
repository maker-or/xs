'use client';
import ReactMarkdown from 'react-markdown';
import { useChat } from 'ai/react';
import { Copy, Check, MoveUpRight, Globe, Play,Square } from 'lucide-react';
import { useEffect, useState, useRef } from "react";
import { marked } from "marked";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat({
    api: '/api/chat',
    onResponse: (_response) => {
      setIsLoading(false);
      resetInputField();
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
        200
      )}px`;
    }
  };

  const resetInputField = () => {
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const copyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  const extractLinks = (content: string): string[] => {
    const linkRegex = /https?:\/\/[^\s]+/g;
    return content.match(linkRegex) ?? [];
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setSearchResults(null);
    setLastQuery(input);

    try {
      handleSubmit(event);
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void onSubmit(event);
    } else if (event.key === 'Enter' && event.shiftKey) {
      adjustTextareaHeight();
    }
  };

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
    <main className="flex h-[100svh] w-screen flex-col bg-[#0c0c0c] overflow-hidden">
      <div className="flex flex-col h-full w-full md:w-2/3 mx-auto relative">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 py-4 md:py-6 px-3 md:px-0 pb-24">
          {messages.map((m, index) => (
            <div
              key={m.id}
              className={`flex flex-col animate-slide-in group relative mx-2 md:mx-0`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {m.role === 'user' ? (
                <div className="max-w-[85vw] md:max-w-xl text-[1.3em] md:text-[2.2em] text-[#E8E8E6] tracking-tight p-2 md:p-4">
                  <article className="whitespace-pre-wrap break-words">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </article>
                </div>
              ) : (
                <div className="max-w-[90vw] md:max-w-2xl text-[0.95rem] md:text-[1.2rem] tracking-tight text-[#E8E8E6] rounded-xl p-3 md:p-4 relative overflow-x-hidden">
                  <ReactMarkdown className="prose prose-invert max-w-none">
                    {m.content}
                  </ReactMarkdown>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <div className='flex items-center justify-center bg-[#4544449d] text-white px-3 py-1.5 rounded-full hover:bg-blue-500'>
                      <button onClick={handleSearchWeb} className="text-sm md:text-base">
                        Web
                      </button>
                      <Globe className="w-4 h-4 ml-1.5" />
                    </div>

                    <div className='flex items-center justify-center bg-[#4544449d] text-white px-3 py-1.5 rounded-full hover:bg-blue-500'>
                      <button onClick={() => handleSearchYouTube(lastQuery)} className="text-sm md:text-base">
                        YouTube
                      </button>
                      <Play className="w-4 h-4 ml-1.5" />
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => copyMessage(m.content, m.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  >
                    {copiedMessageId === m.id ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-[#f7eee3] hover:text-[#FF5E00]" />
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Search Results Section */}
          {searchResults && (
            <div className="mx-3 md:mx-0 p-4 bg-gradient-to-r from-[#1a1a1a] to-[#252525] rounded-xl border border-[#f7eee332] shadow-lg overflow-x-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#FF5E00] flex-shrink-0" />
                  <h3 className="text-base md:text-lg font-medium text-[#E8E8E6] truncate">Web Search Results</h3>
                </div>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4544449d] text-white hover:bg-[#FF5E00] transition-colors duration-200">
                    <span className="text-sm">Sources</span>
                    <Copy className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-max max-w-[300px] p-2 hidden group-hover:block bg-[#1a1a1a] rounded-lg border border-[#f7eee332] shadow-xl z-10">
                    {extractLinks(searchResults).map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-3 py-2 text-sm text-[#E8E8E6] hover:bg-[#252525] rounded-lg truncate"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="prose prose-sm md:prose-base prose-invert max-w-none">
                <ReactMarkdown
                  className="text-[#E8E8E6] opacity-90 leading-relaxed"
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} className="text-[#FF5E00] hover:text-[#ff7e33] no-underline inline-block max-w-full overflow-hidden text-ellipsis" target="_blank" rel="noopener noreferrer" />
                    ),
                    p: ({ node, ...props }) => (
                      <p {...props} className="mb-3 break-words" />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul {...props} className="space-y-2 list-inside" />
                    ),
                    li: ({ node, ...props }) => (
                      <li {...props} className="text-[#E8E8E6] opacity-80 break-words" />
                    ),
                    code: ({ node, ...props }) => (
                      <code {...props} className="inline-block max-w-full overflow-hidden text-ellipsis bg-[#1a1a1a] px-1 py-0.5 rounded" />
                    ),
                  }}
                >
                  {searchResults}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar - Fixed at bottom center */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c80] to-transparent">
          <form onSubmit={onSubmit} className="max-w-2xl mx-auto w-full px-3 md:px-0">
            <div className="flex items-center w-full bg-[#1a1a1a] p-1.5 rounded-2xl border border-[#f7eee332] shadow-lg backdrop-blur-sm hover:border-[#f7eee380] transition-all duration-200">
              <textarea
                ref={textareaRef}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => {
                  handleInputChange(e);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-[48px] max-h-[120px] bg-[#2a2a2a] rounded-xl px-5 py-3 text-[#f7eee3] text-sm md:text-base placeholder:text-[#f7eee380] outline-none resize-none transition-colors duration-200 hover:bg-[#303030] focus:bg-[#353535]"
              />
              <button
                type="submit"
                className="ml-2 p-3 rounded-xl bg-gradient-to-r from-[#FF5E00] to-[#ff7e33] text-[#f7eee3] shadow-md hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:hover:opacity-50"
              >
                {isLoading ? (
                  <Square className="w-5 h-5" fill="#f7eee3" />
                ) : (
                  <MoveUpRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}