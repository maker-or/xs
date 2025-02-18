"use client";
import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useChat } from "ai/react";
import {
  Copy,
  Check,
  Globe,
  Play,
  Share2,
  ArrowUp,
  Paintbrush,
  RotateCw,
  MessageCircleX,
  FileText,
  Sparkles,
} from "lucide-react";

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

import { Editor, Tldraw, TLUiComponents, useEditor } from "tldraw";
import "tldraw/tldraw.css";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

import styles from "~/app/chat.module.css";
import { Attachment, JSONValue } from "ai";


const components: TLUiComponents = {};

function ChatGPTLoadingAnimation() {
  return (
    <div className="flex items-start justify-start">
      <span
        className={`dot ${styles.animateDot} h-1 w-1 rounded-full bg-[#f7eee3]`}
      />
      <span
        className={`dot ${styles.animateDot} h-1 w-1 rounded-full bg-[#f7eee3] ${styles.delay200}`}
      />
      <span
        className={`dot ${styles.animateDot} ${styles.delay400} h-1 w-1 rounded-full bg-[#f7eee3]`}
      />
    </div>
  );
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface VisionText {
  text: {
    text: string;
    toolCalls: any[];
    toolResults: any[];
    finishReason: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    warnings: any[];
    request: {
      body: string;
    };
  };
}

type Checked = DropdownMenuCheckboxItemProps["checked"];

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [isWebSearchLoading, setIsWebSearchLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] =
    useState<string>("google/gemini-2.0-flash-lite-preview-02-05:free");
  const [error, setError] = useState<string | null>(null);
  const [searchLinks, setSearchLinks] = useState<string[]>([]);

  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [whiteboardData, setWhiteboardData] = useState<string | null>(null);
  const whiteboardRef = useRef<HTMLDivElement>(null);
  const tldrawEditor = useRef<Editor | null>(null);

  const [skipAutoScroll, setSkipAutoScroll] = useState(false);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenForMessageId, setRegenForMessageId] = useState<string | null>(
    null,
  );

  const [showStatusBar, setShowStatusBar] = React.useState<Checked>(true);
  const [showActivityBar, setShowActivityBar] =
    React.useState<Checked>(false);
  const [showPanel, setShowPanel] = React.useState<Checked>(false);

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

  const createPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
  
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const lineHeight = 18;
    let y = margin;
  
    // Set default font
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
  
    // Title
    doc.text("SphereAI", margin, y);
    y += lineHeight * 1.5; // Extra spacing after title
  
    // Markdown stripping function
    const stripMarkdown = (text: string) => {
      return text
        .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
        .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Keep link text only
        .replace(/[#>*_`~-]/g, "") // Remove common markdown characters
        .replace(/\n{2,}/g, "\n") // Collapse multiple newlines
        .trim();
    };
  
    // Loop through messages
    messages.forEach((message) => {
      // Write message role (User, Assistant, etc.)
      // doc.text(`${message.role.toUpperCase()}:`, margin, y);
      // y += lineHeight / 2;
  
      // Convert markdown to plain text
      const plainText = stripMarkdown(message.content);
      
      // Split text into lines fitting within page width
      const lines = doc.splitTextToSize(plainText, pageWidth - margin * 2);
      
      // Add text while handling pagination
      lines.forEach((line: string | string[]) => {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      });
  
      y += lineHeight; // Extra spacing between messages
    });
  
    // Save PDF
    doc.save("chat.pdf");
  };
  

  const [chatId, setChatId] = useState<string | undefined>(undefined);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);

  const { messages, input, handleInputChange, handleSubmit, setInput } =
    useChat({
      api: "/api/chat",
      body: {
        model: selectedModel,
       
      },
      id: chatId,
      initialMessages: initialMessages,
      onResponse: (_response) => {
        setIsLoading(false);
        resetInputField();
        setError(null);
        if (isRegenerating) {
          setIsRegenerating(false);
          setRegenForMessageId(null);
        }
      },
      onError: (error) => {
        console.error("Error:", error);
        setIsLoading(false);
        setError("An error occurred. Please try again.");
        console.error("the error is",error)
      },
    });

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
    if (!skipAutoScroll) {
      scrollToBottom();
    }
  }, [messages, isLoading, skipAutoScroll]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200,
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

  function extractText(data: string): string | null {
    try {
      const parsedData: VisionText = JSON.parse(data);
      return parsedData.text.text;
    } catch (error) {
      console.error("Error extracting text:", error);
      return null;
    }
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
  
    setSkipAutoScroll(false);
    setIsLoading(true);
    setSearchResults(null);
    setLastQuery(input);
    setError(null);
  
    try {
      if (
        input.toLowerCase().includes("@whiteboard") &&
        showWhiteboard &&
        tldrawEditor.current
      ) {
        setInput("analyzing...");
        const shapeIds = tldrawEditor.current.getCurrentPageShapeIds();
        if (shapeIds.size === 0) {
          alert("No shapes on the canvas");
          setIsLoading(false);
          return;
        }
  
        try {
          const { blob } = await tldrawEditor.current.toImage([...shapeIds], {
            background: true,
            scale: 0.1,
            quality: 0.1,
            format: "webp",
          });
  
          const file = new File([blob], "canvas.png", { type: "image/png" });
          const reader = new FileReader();
  
          reader.onloadend = async () => {
            const base64Result = reader.result as string;
            const attachment = {
              name: "canvas.png",
              contentType: "image/png",
              data: base64Result.split(",")[1],
            };
  
            console.log("Attachment:", attachment);
            console.log("the data u", attachment.data);
  
            const visionResponse = await fetch("/api/vision", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: attachment.data }),
            });
  
            console.log("the vision  response is", visionResponse);
  
            if (!visionResponse.ok) {
              throw new Error("Failed to analyze image");
            }
  
            const a = visionResponse.body?.getReader();
            console.log("the a is", a);
            if (!reader) {
              throw new Error("Failed to read stream from /api/vision");
            }
  
            const decoder = new TextDecoder();
            let resultText = "";
            if (!a) {
              throw new Error("Failed to read stream from /api/vision");
            }
  
            while (true) {
              const { done, value } = await a.read();
              if (done) break;
              const chunk = decoder.decode(value, { stream: true });
              resultText += chunk;
              // Stream response directly to UI
              setInput(`Analyzing... ${resultText}`);
            }
  
            console.log("Final Vision Text:", resultText);
  
            // Extract the text using the extractText function
            const extractedVisionText = extractText(resultText);
  
            if (extractedVisionText) {
              setInput(extractedVisionText); // Show extracted text in UI
            } else {
              setInput(resultText); // Show the raw result if extraction fails
              console.warn("Failed to extract text, showing raw result.");
            }
  
            setIsLoading(false);
          };
  
          reader.readAsDataURL(file);
        } catch (error) {
          console.error("Error exporting canvas image:", error);
          setIsLoading(false);
          setError("An error occurred while exporting the canvas.");
        }
      } else {
        handleSubmit(event);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsLoading(false);
      setError("An error occurred. Please try again.");
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
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
        query,
      )}`,
      "_blank",
    );
  };

  const handleClearHistory = () => {
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatId");
    window.location.reload();
  };

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

  const regenerateQuery = (query: string, messageId: string) => {
    setRegenForMessageId(messageId);
    setIsRegenerating(true);
    setSkipAutoScroll(true);
    setIsLoading(true);
    setError(null);

    setInput(query);

    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }, 0);
  };

  const processContent = (content: string) => {
    return content.replace(/<think>(.*?)<\/think>/gs, (_, content) =>
      `<details class="think-container" style="background: #1a1a1a; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
        <summary>Thinking proccess</summary>
        <span style="color: #FF5E00; font-weight: bold;">Thinking:</span>
        <div style="margin-top: 0.5rem;">${content}</div>
      </details>`,
    );
  };

  function sanitizeContent(content: string): string {
    return content.replace(/<\/?string>/g, "");
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main
      className={`${
        showWhiteboard ? "pr-[33.333%]" : ""
      } transition-all duration-300`}
    >
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <button
          onClick={shareChat}
          className="hover:bg-[#575757]flex items-center justify-center gap-2 rounded-full bg-[#292a29] p-3 text-sm text-[#f7eee3]"
        >
          <Share2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleClearHistory}
          className="flex items-center justify-center gap-2 rounded-full bg-[#4544449d] p-3 text-white hover:bg-[#575757]"
        >
          <MessageCircleX className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowWhiteboard(true)}
          className="flex items-center justify-center gap-2 rounded-full bg-[#4544449d] p-3 text-white hover:bg-[#575757]"
        >
          <Paintbrush className="h-4 w-4" />
        </button>

        <button
          onClick={createPDF}
          className="flex items-center justify-center gap-2 rounded-full bg-[#4544449d] p-3 text-white hover:bg-[#575757]"
        >
          <FileText /> export
        </button>
      </div>
      <div
        className={`relative mx-auto flex h-full w-full flex-col ${
          showWhiteboard ? "md:w-full" : "md:w-2/3"
        }`}
      >
        <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 pb-24 md:space-y-6 md:px-0 md:py-6">
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fadeIn 0.4s ease-out forwards;
            }
            @keyframes textReplace {
              0% { opacity: 1; transform: translateY(0); }
              20% { opacity: 0; transform: translateY(-8px); }
              40% { opacity: 0; transform: translateY(8px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .textReplace {
              animation: textReplace 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .loading-text {
              background: linear-gradient(90deg, #666 0%, #999 50%, #666 100%);
              background-size: 200% auto;
              animation: gradient 2s linear infinite;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }
            @keyframes gradient {
              0% { background-position: 0% center; }
              100% { background-position: -200% center; }
            }
            .loaded-text {
              color: #E8E8E6;
              transition: color 0.3s ease;
            }
          `}</style>

          {messages.map((m, index) => {
            const previousUserMessage =
              m.role === "assistant" &&
              index > 0 &&
              messages[index - 1]?.role === "user"
                ? messages[index - 1]?.content ?? ""
                : "";
            return m.role === "user" ? (
              <div
                key={m.id}
                className="animate-slide-in group relative mx-2 flex flex-col md:mx-0"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="max-w-[85vw] text-[1.3em]/9 start-end tracking-tight font-serif  rounded-2xl text-[#E8E8E6] md:max-w-xl md:p-4 md:text-[2em]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div
                key={m.id}
                className="animate-slide-in group relative  flex flex-col md:mx-0"
              >
                <div className="relative max-w-[90vw] overflow-x-hidden rounded-xl p-1 text-[0.95rem] tracking-tight text-[#E8E8E6] md:max-w-2xl md:p-2 md:text-[1.2rem]">
                  <div
                    className={`${"animate-fade-in"} transition-opacity duration-500`}
                  >
                    <ReactMarkdown
                      className="prose prose-invert max-w-none"
                      remarkPlugins={[remarkGfm]}
                    >
                      {sanitizeContent(m.content)}
                    </ReactMarkdown>
                  </div>

                  <div className="mb-14 flex flex-wrap gap-2">
                    <div className="flex items-center justify-center rounded-full bg-[#4544449d] p-3 text-white transition-colors hover:bg-[#294A6D] hover:text-[#48AAFF]">
                      <button
                        onClick={handleSearchWeb}
                        className="text-sm md:text-base"
                      >
                        <Globe className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center rounded-full bg-[#4544449d] p-3 text-white transition-colors hover:bg-[#294A6D] hover:text-[#48AAFF]">
                      <button
                        onClick={() => handleSearchYouTube(lastQuery)}
                        className="text-sm md:text-base"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    </div>
                    {previousUserMessage && (
                      <div className="flex items-center justify-center rounded-full bg-[#4544449d] p-3 text-white transition-colors hover:bg-[#294A6D] hover:text-[#48AAFF]">
                        <button
                          onClick={() =>
                            regenerateQuery(previousUserMessage, m.id)
                          }
                          className="text-sm md:text-base"
                          disabled={regenForMessageId === m.id || isLoading}
                        >
                          {regenForMessageId === m.id ? (
                            <ChatGPTLoadingAnimation />
                          ) : (
                            <RotateCw className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    )}
                    <div className="flex items-center justify-center rounded-full bg-[#4544449d] p-3 text-white transition-colors hover:bg-[#294A6D] hover:text-[#48AAFF]">
                      <button
                        onClick={() => copyMessage(m.content, m.id)}
                        className="text-sm md:text-base"
                      >
                        {copiedMessageId === m.id ? (
                          <Check className="h-4 w-4 text-[#48AAFF]" />
                        ) : (
                          <Copy className="h-4 w-4 text-[#f7eee3] hover:text-[#48AAFF]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

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
                >
                  {sanitizeContent(searchResults)}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div
          className={`fixed bottom-0 ${
            showWhiteboard ? "right-[33.333%]" : "right-0"
          } left-0 bg-gradient-to-t from-[#0c0c0c] via-[#0c0c0c80] to-transparent p-4 m-2 transition-all duration-300`}
        >
          <button
            onClick={scrollToTop}
            className="absolute top-2 right-2 z-20 rounded-full bg-[#4544449d] p-2 text-white hover:bg-[#575757]"
          >
            ↑
          </button>
          <form
            onSubmit={onSubmit}
            className={`mx-auto w-full ${
              showWhiteboard ? "max-w-full px-4" : "max-w-2xl px-3 md:px-0"
            }`}
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
                  className="max-w-[110px] cursor-pointer bg-transparent text-sm text-[#f7eee3] focus:outline-none"
                >
                  <option value="google/gemini-2.0-flash-lite-preview-02-05:free">gemini-2.0-flash</option>
                  <option value="deepseek/deepseek-r1:free">deepseek-r1</option>
                  <option value="deepseek/deepseek-chat:free">deepseek-v3</option>
                  <option value="meta-llama/llama-3.3-70b-instruct:free">llama-3.3</option>
                  <option value="mistralai/mistral-small-24b-instruct-2501:free">mistral-3</option>
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

      {showWhiteboard && (
        <div
          ref={whiteboardRef}
          className="fixed right-0 top-0 z-20 h-[100svh] w-full border-l border-[#f7eee332] md:w-1/3 bg-[#1a1a1a]"
          style={{ touchAction: "none" }}
        >
          <Tldraw
            inferDarkMode
            components={components}
            onMount={(editor: Editor) => {
              editor.setCamera({ x: 0, y: 0, z: 0 });
              tldrawEditor.current = editor;
            }}
          />
          <button
            onClick={() => setShowWhiteboard(false)}
            className="absolute top-0 right-0 z-30 flex items-center justify-center gap-2 
                       rounded-bl-xl bg-[#1A1A1C] p-3 text-sm text-[#f7eee3] 
                       hover:bg-[#575757]"
          >
            Close
          </button>
        </div>
      )}
    </main>
  );
}
