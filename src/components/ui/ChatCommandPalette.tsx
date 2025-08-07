'use client';
import { useQuery } from 'convex/react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../../convex/_generated/api';

interface ChatCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatCommandPalette = ({ isOpen, onClose }: ChatCommandPaletteProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch chats from Convex
  const chats = useQuery(api.chats.listChats);
  const searchResults = useQuery(
    api.chats.searchChats,
    searchQuery.trim() ? { query: searchQuery } : 'skip'
  );

  // Focus management
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  // Filter chats based on search query
  const filteredChats = searchQuery.trim()
    ? searchResults || []
    : (chats || []).slice(0, 10); // Show recent 10 chats when no search

  const handleArrowNavigation = (direction: 'up' | 'down') => {
    if (direction === 'down') {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % filteredChats.length);
    } else {
      setSelectedIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredChats.length) % filteredChats.length
      );
    }
  };

  const handleChatSelection = (chatId?: string) => {
    const selectedChat = chatId
      ? filteredChats.find((chat) => chat._id === chatId)
      : filteredChats[selectedIndex];
    if (selectedChat) {
      router.push(`/learning/${selectedChat._id}`);
      onClose();
    }
  };

  const formatChatDate = (timestamp: number) => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Main container with Learning page design language */}
      <div className="relative rounded-2xl border border-white/20 bg-black/80 shadow-2xl backdrop-blur-xl">
        {/* Noise overlay matching Learning page */}
        <div
          className="absolute inset-0 z-0 rounded-2xl opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />

        <div className="relative z-10 max-h-[80vh] w-[600px] max-w-[90vw] overflow-hidden">
          {/* Header */}
          <div className="border-white/20 border-b p-1">
            <input
              className="w-full bg-transparent p-3 px-4 py-3 text-white outline-none backdrop-blur-sm placeholder:text-white/50"
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') handleArrowNavigation('down');
                if (e.key === 'ArrowUp') handleArrowNavigation('up');
                if (e.key === 'Enter') handleChatSelection();
                if (e.key === 'Escape') onClose();
              }}
              placeholder="search chats..."
              ref={searchInputRef}
              type="text"
              value={searchQuery}
            />
          </div>

          {/* Chat list */}
          <div className="max-h-96 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="py-8 text-center text-white/50">
                {searchQuery.trim() ? 'No chats found' : 'No chats available'}
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {filteredChats.map((chat, index) => (
                  <li
                    className={`cursor-pointer px-6 py-4 transition-all duration-150 ${
                      index === selectedIndex
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    } `}
                    key={chat._id}
                    onClick={() => handleChatSelection(chat._id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-light text-lg">
                          {truncateText(chat.title, 50)}
                        </p>
                        {chat.pinned && (
                          <span className="text-sm text-yellow-400">📌</span>
                        )}
                      </div>
                      {/* <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60">
                          {chat.model.split("/").pop() || "Unknown model"}
                        </span>
                        <span className="text-white/40">
                          {formatChatDate(chat.updatedAt)}
                        </span>
                      </div> */}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-white/20 border-t p-4 text-center">
            <p className="text-sm text-white/40">
              Press{' '}
              <kbd className="rounded bg-white/10 px-2 py-1 text-xs">↑↓</kbd> to
              navigate,
              <kbd className="ml-1 rounded bg-white/10 px-2 py-1 text-xs">
                Enter
              </kbd>{' '}
              to select,
              <kbd className="ml-1 rounded bg-white/10 px-2 py-1 text-xs">
                Esc
              </kbd>{' '}
              to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCommandPalette;
