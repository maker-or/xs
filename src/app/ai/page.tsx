'use client';

import React, { useState, useRef, useEffect } from 'react';
import { type Message, useChat } from 'ai/react';
import { ArrowUpRight } from 'lucide-react';
import '~/styles/globals.css';

interface ChatHelpers {
  messages: Message[];
  input: string;
  handleSubmit: (event: React.FormEvent) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isLoading: boolean;
}

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: []
  }) as ChatHelpers;

  const [submitted, setSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    setSubmitted(true);
    handleSubmit(event);
  };

  // const handleGoogleSearch = (query: string, type: 'images' | 'videos') => {
  //   const searchType = type === 'images' ? 'isch' : 'vid';
  //   const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=${searchType}`;
  //   window.open(url, '_blank');
  // };

  return (
    <div className="absolute inset-0 -z-10 h-full w-full flex flex-col items-center px-5 py-12 bg-gradient-to-b from-[#180B03] to-[#000]">
      {!submitted && (
        <div className="flex flex-col items-center gap-4 mb-8">
          <h1 className="text-5xl md:text-6xl font-serif text-white animate-fade-in">
            Ask Anything
          </h1>
        </div>
      )}

      <div className="flex flex-col w-full max-w-2xl mx-auto h-full">
        <div className={`flex-1 overflow-y-auto px-4 ${submitted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
          {messages.map((m, index) => (
            <div
              key={m.id}
              className={`flex flex-col gap-4 mb-4 animate-slide-in ${m.role === 'user' ? 'items-start' : 'items-start'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {m.role === 'user' ? (
                <div className="flex items-start gap-4 font-serif">
                  <div className="max-w-xl text-[3rem] text-[#ff5e00b3] tracking-tight  rounded-xl p-4">
                    <h1 className="whitespace-pre-wrap">{m.content}</h1>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  <div className="max-w-screen-lg tracking-tight text-[#f7eee3a7] text-[1.4rem] rounded-xl p-4">
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                  {/* Buttons for Google Search */}
                  {/* <div className="flex gap-4">
                    <button
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      onClick={() => handleGoogleSearch(m.content, 'images')}
                    >
                      Search Images
                    </button>
                    <button
                      className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                      onClick={() => handleGoogleSearch(m.content, 'videos')}
                    >
                      Search Videos
                    </button>
                  </div> */}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={onSubmit} className="mt-4">
          <div className={`relative flex items-center border-2 border-[#f7eee3]/10 rounded-full transition-all duration-500 ${submitted ? 'mb-6' : 'mt-4'}`}>
            <input
              type="text"
              placeholder="Ask me anything..."
              value={input}
              onChange={handleInputChange}
              className="w-full pl-8 pr-16 py-4 bg-[#2C2C2C] text-[#f7eee3] ring-orange-300/30 rounded-full font-serif placeholder-gray-400 outline-none focus:ring-2   transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-1 p-3 rounded-full bg-[#0a0a0a] text-[#f7eee3] hover:bg-white/10 hover:text-orange-600 transition-colors disabled:opacity-50"
            >
              <ArrowUpRight className="h-6 w-6 text-[#f7eee3] hover:text-orange-600" />
            </button>
          </div>
        </form>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
