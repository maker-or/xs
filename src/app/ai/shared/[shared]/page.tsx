"use client";
import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useChat } from "ai/react";
import { Copy, Check, Globe, Play, Share2 } from "lucide-react";
import { useParams } from "next/navigation";

function ChatGPTLoadingAnimation() {
  return (
    <div className="flex items-start justify-start">
      <span className="dot animate-dot h-1 w-1 rounded-full bg-[#f7eee3]" />
      <span className="dot animate-dot h-1 w-1 rounded-full bg-[#f7eee3] delay-200" />
      <span className="dot animate-dot delay-400 h-1 w-1 rounded-full bg-[#f7eee3]" />
      <style>
        {`
          @keyframes dotFlashing {
            0% { opacity: 0.2; }
            50% { opacity: 1; }
            100% { opacity: 0.2; }
          }
          .animate-dot {
            animation: dotFlashing 1.4s infinite linear;
          }
          .delay-200 {
            animation-delay: 0.2s;
          }
          .delay-400 {
            animation-delay: 0.4s;
          }
        `}
      </style>
    </div>
  );
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function Page() {
  // Using useParams to get the dynamic shareId from the route: /ai/shared/[shared]
  const { shared } = useParams();
  console.log("Share ID from URL:", shared);
  

  // Shared conversation state – these will be fetched from your API,
  // but also allow you to re‑share or clear (if desired)
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("llama3-70b-8192");
  const [error, setError] = useState<string | null>(null);
  const [searchLinks, setSearchLinks] = useState<string[]>([]);

  // Also include local chat state from useChat (for UI consistency)
  // For a shared conversation, you might populate the UI with fetched messages.
  // We use the same hook in order to keep the UI consistent.
  // Update the useChat hook configuration
  const { messages: liveMessages, input, handleInputChange, handleSubmit, setInput } =
    useChat({
      api: "/api/chat",
      body: { model: selectedModel },
      initialMessages: messages,
      onFinish: (message) => {
        // Update both live messages and shared messages state
        setMessages(prevMessages => [...prevMessages, { ...message, role: message.role === 'system' ? 'assistant' : message.role } as Message]);
        setLoading(false);
        resetInputField();
        setError(null);
      },
      onError: (error) => {
        console.error("Error:", error);
        setLoading(false);
        setError("An error occurred. Please try again.");
      },
    });

  // Update the onSubmit handler
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setSearchResults(null);
    setLastQuery(input);
    setError(null);

    // Add user message immediately to the UI
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    setMessages(prevMessages => [...prevMessages, userMessage as Message]);

    try {
      handleSubmit(event);
    } catch (error) {
      console.error("Error submitting form:", error);
      setLoading(false);
      setError("An error occurred. Please try again.");
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!loading) scrollToBottom();
  }, [loading, messages.length, liveMessages.length]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  const resetInputField = () => {
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const copyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const extractLinks = (content: string): string[] => {
    const linkRegex = /https?:\/\/[^\s]+/g;
    return content.match(linkRegex) ?? [];
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setSearchResults(null);
    setLastQuery(input);
    setError(null);

    try {
      handleSubmit(event);
    } catch (error) {
      console.error("Error submitting form:", error);
      setLoading(false);
      setError("An error occurred. Please try again.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void onSubmit(event);
    } else if (event.key === "Enter" && event.shiftKey) {
      adjustTextareaHeight();
    }
  };

  const handleSearchWeb = async () => {
    if (!lastQuery.trim()) return;
    setLoading(true); // Set loading to true only when a search is initiated
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "assistant", content: lastQuery }],
        }),
      });
      if (!response.ok) {
        throw new Error(`Search failed: HTTP status ${response.status}`);
      }
      const data = await response.json();
      const links = extractLinks(data.results);
      setSearchLinks(links);
      const cleanedResults = data.results.replace(/https?:\/\/[^\s]+/g, "");
      setSearchResults(cleanedResults);
    } catch (error) {
      console.error("Error during web search:", error);
      setSearchResults("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false); // Ensure loading is set to false after search completes
    }
  };

  //Update the loading animation condition
//   {  searchResults ===   lastQuery && (
//     <div className="animate-slide-in group relative mx-2 flex flex-col md:mx-0">
//       <div className="max-w-[90vw] rounded-xl p-3 text-[0.95rem] tracking-tight text-[#E8E8E6] shadow-lg md:max-w-2xl md:p-4 md:text-[0.8rem]">
//         <div className="flex items-center justify-start gap-2">
//           <ChatGPTLoadingAnimation />
//           <span className="text-sm tracking-tight text-[#e8e8e67d]">
//             Searching
//           </span>
//         </div>
//       </div>
//     </div>
//   )}

  const handleSearchYouTube = (query: string) => {
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      "_blank"
    );
  };

  const handleClearHistory = () => {
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatId");
    window.location.reload();
  };

  // shareChat sends the full conversation to your API endpoint (POST /api/shared)
//   // and then generates a shareable URL that is copied to the clipboard.
//   const shareChat = async () => {
//     try {
//       const response = await fetch("/api/shared", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({ messages: liveMessages }), // using liveMessages from useChat
//       });
//       if (!response.ok) {
//         throw new Error("Failed to share chat.");
//       }
//       const data = await response.json();
//       const shareURL = `${window.location.origin}/ai/shared/${data.shareId}`;
//       await navigator.clipboard.writeText(shareURL);
//       alert(`Chat link copied to clipboard: ${shareURL}`);
//     } catch (error) {
//       console.error("Error sharing chat:", error);
//       alert("Error sharing chat. Please try again later.");
//     }
//   };

  // Fetch the shared conversation if shareId exists.
  // Since this page is for sharing, we fetch from our API using the route parameter.
  useEffect(() => {
    if (!shared) {
      setLoading(false);
      return;
    }

    // Validate shareId format
    if (typeof shared !== 'string') {
      setError('Invalid share ID format');
      setLoading(false);
      return;
    }

    const fetchSharedChat = async () => {
      try {
        // Changed to use query parameter instead of path parameter
        const res = await fetch(`/api/shared/${encodeURIComponent(shared)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error("Error fetching shared chat:", err);
        setError('Failed to load shared conversation');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedChat();
  }, [shared]);

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-[#0c0c0c] pb-16">
      <div className="relative mx-auto flex h-full w-full flex-col md:w-2/3">
        {/* Clear History and Share Buttons */}
        {/* <div className="absolute right-4 top-4 z-10 flex gap-2">
          <button
            onClick={shareChat}
            className="rounded-full bg-[#4544449d] px-4 py-2 text-sm text-white hover:bg-[#FF5E00] flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share Chat
          </button>
          <button
            onClick={handleClearHistory}
            className="rounded-full bg-[#4544449d] px-4 py-2 text-sm text-white hover:bg-[#FF5E00]"
          >
            Clear History
          </button>
        </div> */}

        {/* Messages Container */}
        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 pb-24 md:space-y-6 md:px-0 md:py-6">
          {messages.map((m, index) => (
            <div
              key={m.id}
              className="animate-slide-in group relative mx-2 flex flex-col md:mx-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {m.role === "user" ? (
                <div className="max-w-[85vw] p-2 text-[1.3em] tracking-tight text-[#E8E8E6] md:max-w-xl md:p-4 md:text-[2.2em]">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      hr: ({ node, ...props }) => (
                        <hr {...props} className="my-custom-hr-class" />
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="relative max-w-[90vw] overflow-x-hidden rounded-xl p-3 text-[0.95rem] tracking-tight text-[#E8E8E6] md:max-w-2xl md:p-4 md:text-[1.2rem]">
                  <ReactMarkdown
                    className="prose prose-invert max-w-none"
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className="inline-block max-w-full overflow-hidden text-ellipsis text-[#FF5E00] no-underline hover:text-[#ff7e33]"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p {...props} className="mb-3 break-words" />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-inside space-y-2" />
                      ),
                      li: ({ node, ...props }) => (
                        <li
                          {...props}
                          className="break-words text-[#E8E8E6] opacity-80"
                        />
                      ),
                    }}
                  >
                    {m.content}
                  </ReactMarkdown>

                  {/* Action Buttons */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <div className="flex items-center justify-center rounded-full bg-[#4544449d] px-3 py-1.5 text-white transition-colors hover:bg-blue-500">
                      <button
                        onClick={() => {
                          setLastQuery(m.content);
                          handleSearchWeb();
                        }}
                        className="text-sm md:text-base"
                      >
                        Web
                      </button>
                      <Globe className="ml-1.5 h-4 w-4" />
                    </div>

                    <div className="flex items-center justify-center rounded-full bg-[#4544449d] px-3 py-1.5 text-white transition-colors hover:bg-blue-500">
                      <button
                        onClick={() => handleSearchYouTube(m.content)}
                        className="text-sm md:text-base"
                      >
                        YouTube
                      </button>
                      <Play className="ml-1.5 h-4 w-4" />
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => copyMessage(m.content, m.id)}
                    className="absolute right-2 top-2 p-2 opacity-0 transition-opacity group-hover:opacity-100"
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

          {/* Loading Animation for Assistant Response */}
          {loading &&
            (messages.length === 0 ||
              messages[messages.length - 1]?.role === "user") && (
              <div className="animate-slide-in group relative mx-2 flex flex-col md:mx-0">
                <div className="max-w-[90vw] rounded-xl p-3 text-[0.95rem] tracking-tight text-[#E8E8E6] shadow-lg md:max-w-2xl md:p-4 md:text-[0.8rem]">
                  <div className="flex items-center justify-start gap-2">
                    <ChatGPTLoadingAnimation />
                    <span className="text-sm tracking-tight text-[#e8e8e67d]">
                      creating
                    </span>
                  </div>
                </div>
              </div>
            )}

          {/* Loading Animation for Web Search */}
          { searchResults === null && lastQuery && (
            <div className="animate-slide-in group relative mx-2 flex flex-col md:mx-0">
              <div className="max-w-[90vw] rounded-xl p-3 text-[0.95rem] tracking-tight text-[#E8E8E6] shadow-lg md:max-w-2xl md:p-4 md:text-[0.8rem]">
                <div className="flex items-center justify-start gap-2">
                  <ChatGPTLoadingAnimation />
                  <span className="text-sm tracking-tight text-[#e8e8e67d]">
                    Searching
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Search Results Section */}
          {searchResults && (
            <div className="mx-3 overflow-x-hidden rounded-xl border border-[#f7eee332] bg-gradient-to-r from-[#1a1a1a] to-[#252525] p-4 shadow-lg md:mx-0">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 flex-shrink-0 text-[#FF5E00]" />
                  <h3 className="truncate text-base font-medium text-[#E8E8E6] md:text-lg">
                    Web Search Results
                  </h3>
                </div>
                <div className="group relative">
                  <button className="flex items-center gap-2 rounded-full bg-[#4544449d] px-3 py-1.5 text-white transition-colors duration-200 hover:bg-[#FF5E00]">
                    <span className="text-sm">Sources</span>
                    <Copy className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 z-10 mt-2 hidden w-max max-w-[300px] rounded-lg border border-[#f7eee332] bg-[#1a1a1a] p-2 shadow-xl group-hover:block">
                    {searchLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate rounded-lg px-3 py-2 text-sm text-[#E8E8E6] hover:bg-[#252525]"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="prose prose-sm md:prose-base prose-invert max-w-none">
                <ReactMarkdown
                  className="leading-relaxed text-[#E8E8E6] opacity-90"
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className="inline-block max-w-full overflow-hidden text-ellipsis text-[#FF5E00] no-underline hover:text-[#ff7e33]"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p {...props} className="mb-3 break-words" />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul {...props} className="list-inside space-y-2" />
                    ),
                    li: ({ node, ...props }) => (
                      <li
                        {...props}
                        className="break-words text-[#E8E8E6] opacity-80"
                      />
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

        {/* Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c80] to-transparent p-4">
          <form
            onSubmit={onSubmit}
            className="mx-auto w-full max-w-2xl px-3 md:px-0"
          >
            <div className="group flex w-full items-center rounded-2xl border border-[#f7eee332] bg-gradient-to-r from-[#1a1a1a] to-[#1f1f1f] p-2.5 shadow-lg backdrop-blur-sm transition-all duration-300">
              <div className="flex flex-1 items-center overflow-hidden rounded-xl border border-transparent bg-[#2a2a2a] p-2 transition-all duration-300 group-hover:border-[#f7eee332]">
                <textarea
                  ref={textareaRef}
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => {
                    handleInputChange(e);
                    adjustTextareaHeight();
                  }}
                  onKeyDown={handleKeyDown}
                  className="max-h-[120px] min-h-[48px] flex-1 resize-none bg-transparent px-4 py-3 text-sm text-[#f7eee3] outline-none transition-all duration-200 placeholder:text-[#f7eee380] md:text-base"
                />
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="min-w-[120px] cursor-pointer bg-transparent text-sm text-[#f7eee3] focus:outline-none"
                >
                  <option value="llama3--70b--8192">Llama 3 70B</option>
                  {/* <option value="llama-3.1-8b-instant">
                    llama-3.1-8b-instant
                  </option> */}
                  <option value="mixtral-8x7b-32768">mixtral-8x7b</option>
                  <option value="deepseek-r1-distill-llama-70b">deepseek-r1</option>
                </select>
              </div>
            </div>

            {input.length > 0 && (
              <div className="mt-1.5 flex items-center justify-between px-1 text-xs text-[#f7eee380]">
                <span>
                  {input.length > 0
                    ? "Press Enter to send, Shift + Enter for new line"
                    : ""}
                </span>
                <span>{input.length}/2000</span>
              </div>
            )}

            {error && (
              <div className="mt-2 text-center text-sm text-red-500">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}