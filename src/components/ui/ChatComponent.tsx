
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, ChevronLeft, Search, Pause, Play, RotateCw } from 'lucide-react';
import { useChat } from 'ai/react';


const ChatComponent = ({ onClose }: { onClose: () => void }) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: aiHandleSubmit,
  } = useChat({
    initialMessages: [],
    api:'/api/chat/server',
  });

  // const [submitted, setSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    // setSubmitted(true);

    try {
      aiHandleSubmit(event);
    } catch (error) {
      console.error('Error while submitting the message:', error);
    }
  };

  return (
    <div className="bg-[#0c0c0c]/60 backdrop-blur-2xl text-[#f7eee3] rounded-3xl p-6 w-1/2 max-h-[600px] flex flex-col shadow-2xl border font-sans border-[#f7eee3]/20 relative overflow-hidden">
      {/* Glassmorphic background effect */}

      <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c]/10 to-[#0c0c0c]/5 opacity-50 -z-10 blur-3xl"></div>

      <div className="flex gap-3 items-center mb-6">
        <button
          onClick={onClose}
          className="text-[#f7eee3]/70 hover:text-[#f7eee3] transition-colors bg-[#f7eee3]/10 rounded-full p-2"
        >
          <ChevronLeft size={24} />
        </button>


        <form onSubmit={onSubmit} className="mt-4 w-full flex gap-2">
          <div className="relative mb-6 flex gap-2 w-full text-[#0c0c0c]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f7eee3] p-2 bg-[#0c0c0c] z-10 rounded-sm"
              size={38}
            />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}

              placeholder="Search Anything..."
              className="w-full pl-16 p-4 bg-gradient-to-r from-[#f7eee3] to-[#ABABAB] backdrop-blur-md text-[#0c0c0c] rounded-xl font-sans border-[#f7eee3]/20 focus:outline-none  placeholder:text-[#0c0c0c]"
            />
          </div>
        </form>

      </div>

      {/* Messages Container */}
      <div className="flex-grow overflow-y-auto   space-y-4 mb-4 pr-2">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`px-3 rounded-lg max-w-[90%} ${message.role === 'user'
                ? ' text-[#f7eee3]/60 font-serif text-[1.8rem]'
                : ' text-[#f7eee3] text-[1.2rem] tracking-tight'
              }`} 
          >
            {message.content}
          </div>
        ))}
        <div ref={messagesEndRef} /> {/* Anchor for auto-scrolling */}
      </div>

      {/* Input Area */}

    </div>
  );
};
export default ChatComponent