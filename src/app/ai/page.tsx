"use client";
import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useChat } from "ai/react";
import { Copy, Check, Globe, Play, Share2 } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isWebSearchLoading, setIsWebSearchLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("llama3-70b-8192");
  const [error, setError] = useState<string | null>(null);
  const [searchLinks, setSearchLinks] = useState<string[]>([]);

  // We'll manage messages locally so we can update (delete) an assistant
  // message when regenerating a query.
  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);

  // Load stored chat ID and messages on component mount
  useEffect(() => {
    const storedChatId = localStorage.getItem("chatId");
    if (storedChatId) {
      setChatId(storedChatId);
    }
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      try {
        setInitialMessages(JSON.parse(storedMessages));
      } catch (err) {
        console.error("Failed to parse stored messages", err);
      }
    }
  }, []);

  // Use the useChat hook with initialMessages and chatId
  const { messages, input, handleInputChange, handleSubmit, setInput } =
    useChat({
      api: "/api/chat",
      body: {
        model: selectedModel,
        format: selectedModel === "deepseek-r1-distill-llama-70b" ? {
          systemPrompt: "don't show the thinking process. just provide the answer",
          responseFormat: "structured"
        } : undefined
      },
      id: chatId,
      initialMessages: initialMessages,
      onResponse: (_response) => {
        setIsLoading(false);
        resetInputField();
        setError(null);
      },
      onError: (error) => {
        console.error("Error:", error);
        setIsLoading(false);
        setError("An error occurred. Please try again.");
      },
    });

  // Save messages to localStorage anytime they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading, messages.length]);

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

    setIsLoading(true); // Ensure loading state is set
    setSearchResults(null);
    setLastQuery(input);
    setError(null);

    try {
      handleSubmit(event);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsLoading(false);
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
    if (!lastQuery.trim()) {
      console.error("No query to search");
      return;
    }

    setIsWebSearchLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: lastQuery,
            },
          ],
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
      setIsWebSearchLoading(false);
    }
  };

  const handleSearchYouTube = (query: string) => {
    window.open(
      `https://www.youtube.com/results?search_query=${encodeURIComponent(
        query
      )}`,
      "_blank"
    );
  };

  // Handler to clear chat history and chat ID both in state and localStorage.
  const handleClearHistory = () => {
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatId");
    window.location.reload();
  };

  // Share the chat via API and copy the shareable URL to clipboard.
  const shareChat = async () => {
    try {
      const response = await fetch("/api/shared", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages }),
      });
      if (!response.ok) {
        throw new Error("Failed to share chat.");
      }
      const data = await response.json();
      const shareURL = `${window.location.origin}/ai/shared/${data.shareId}`;
      await navigator.clipboard.writeText(shareURL);
      alert(`Chat link copied to clipboard: ${shareURL}`);
    } catch (error) {
      console.error("Error sharing chat:", error);
      alert("Error sharing chat. Please try again later.");
    }
  };

  /**
   * The regenerateQuery function removes the assistant message
   * corresponding to the provided user query (if any) from the local
   * messages (via initialMessages) so that the new response will render
   * in its place.
   */
  const regenerateQuery = async (query: string, messageId: string) => {
    // Filter out the specific assistant response that follows the user message with the matching query.
    const updatedMessages = messages.filter((m, index) => {
      if (
        m.role === "assistant" &&
        m.id === messageId &&
        index > 0 &&
        messages[index - 1]?.role === "user" &&
        messages[index - 1]?.content === query
      ) {
        return false; // Remove the specific assistant response
      }
      return true;
    });

    // Update the locally stored messages.
    setInitialMessages(updatedMessages as Message[]);

    // Also update localStorage for consistency.
    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));

    // Prepare to resend the same query.
    setInput(query);
    setIsLoading(true);
    setSearchResults(null);
    setError(null);

    try {
      // Create and dispatch a synthetic submit event.
      await handleSubmit(new Event("submit"));
    } catch (error) {
      console.error("Error regenerating query:", error);
      setIsLoading(false);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-[#0c0c0c] pb-16">
              <div className="absolute right-4 top-4 z-10 flex gap-2">
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
        </div>
      <div className="relative mx-auto flex h-full w-full flex-col md:w-2/3">
        {/* Clear History and Share Buttons */}


        {/* Messages Container */}
        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 pb-24 md:space-y-6 md:px-0 md:py-6">
          {messages.map((m, index) => {
            // For assistant messages, pick the immediately preceding user query.
            const previousUserMessage =
              m.role === "assistant" &&
              index > 0 &&
              messages[index - 1]?.role === "user"
                ? messages[index - 1]?.content ?? ""
                : "";
            return (
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
                        )
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
                          <li {...props} className="break-words text-[#E8E8E6] opacity-80" />
                        )
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>

                    {/* Action Buttons */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <div className="flex items-center justify-center rounded-full bg-[#4544449d] px-3 py-1.5 text-white transition-colors hover:bg-blue-500">
                        <button
                          onClick={handleSearchWeb}
                          className="text-sm md:text-base"
                        >
                          Web
                        </button>
                        <Globe className="ml-1.5 h-4 w-4" />
                      </div>

                      <div className="flex items-center justify-center rounded-full bg-[#4544449d] px-3 py-1.5 text-white transition-colors hover:bg-blue-500">
                        <button
                          onClick={() => handleSearchYouTube(lastQuery)}
                          className="text-sm md:text-base"
                        >
                          YouTube
                        </button>
                        <Play className="ml-1.5 h-4 w-4" />
                      </div>
                    </div>

                    {/* Regenerate Button */}
                    {previousUserMessage && (
                      <div className="mt-3">
                        <button
                          onClick={() => regenerateQuery(previousUserMessage, m.id)}
                          className="rounded-full bg-[#4544449d] px-3 py-1.5 text-sm text-white transition-colors hover:bg-[#FF5E00]"
                        >
                          Regenerate
                        </button>
                      </div>
                    )}

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
            );
          })}

          {/* Loading Animation for Assistant Response */}
          {isLoading &&
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
          {isWebSearchLoading && (
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
                      <li {...props} className="break-words text-[#E8E8E6] opacity-80" />
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
                  <option value="llama-3.1-8b-instant">
                    llama-3.1-8b-instant
                  </option>
                  <option value="mixtral-8x7b-32768">mixtral-8x7b</option>
                  <option value="llama-3.3-70b-specdec">
                  llama-3.3-70b
                  </option>
                  {/* Add more options as needed */}
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
