'use client';
import { useChat } from 'ai/react';
import { ChevronLeft } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef } from 'react';

const ChatComponent = ({ onClose }: { onClose: () => void }) => {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: aiHandleSubmit,
  } = useChat({
    initialMessages: [],
    api: '/api/Intelligent',
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
    <div className="relative flex max-h-[600px] w-1/2 flex-col overflow-hidden rounded-3xl border border-[#f7eee3]/20 bg-[#000000]/60 p-6 font-sans text-[#f7eee3] shadow-2xl backdrop-blur-2xl">
      {/* Glassmorphic background effect */}

      <div className="-z-10 absolute inset-0 bg-gradient-to-br from-[#000000]/10 to-[#000000]/5 opacity-50 blur-3xl" />

      <div className="mb-6 flex items-center gap-3">
        <form className="mt-4 flex w-full gap-2" onSubmit={onSubmit}>
          <div className="relative mb-6 flex w-full gap-2 text-[#000000]">
            <button
              className="-translate-y-1/2 absolute top-1/2 left-3 z-10 rounded-full bg-[#000000] p-2 text-[#f7eee3]"
              onClick={onClose}
            >
              <ChevronLeft size={24} />
            </button>

            <input
              className="w-full rounded-xl border-[#f7eee3]/20 bg-gradient-to-r from-[#f7eee3] to-[#ABABAB] p-4 pl-16 font-sans text-[#000000] backdrop-blur-md placeholder:text-[#000000] focus:outline-none"
              onChange={handleInputChange}
              placeholder="Search Anything..."
              ref={inputRef}
              type="text"
              value={input}
            />
          </div>
        </form>
      </div>

      {/* Messages Container */}
      <div className="mb-4 flex-grow space-y-4 overflow-y-auto pr-2">
        {messages.map((message) => (
          <div
            className={`max-w-[90%} rounded-lg px-3 ${
              message.role === 'user'
                ? ' font-serif text-[#f7eee3]/60 text-[1.8rem]'
                : ' text-[#f7eee3] text-[1.2rem] tracking-tight'
            }`}
            key={message.id}
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
export default ChatComponent;
