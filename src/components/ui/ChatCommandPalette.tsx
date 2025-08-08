'use client';
import { useQuery } from 'convex/react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';

interface ChatCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

type Mode = 'chat' | 'learn';

// Type guards to safely check item types
const isChat = (item: any): item is { _id: Id<'chats'>; title: string; model: string; updatedAt: number; pinned: boolean } => {
  return 'title' in item && 'model' in item && 'updatedAt' in item && 'pinned' in item;
};

const isCourse = (item: any): item is { _id: Id<'Course'>; prompt: string; stages: any[]; createdAt: number } => {
  return 'prompt' in item && 'stages' in item && 'createdAt' in item;
};

const ChatCommandPalette = ({ isOpen, onClose }: ChatCommandPaletteProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentMode, setCurrentMode] = useState<Mode>('chat');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch chats and courses from Convex
  const chats = useQuery(api.chats.listChats);
  const courses = useQuery(api.course.listCourse);
  
  const searchChatResults = useQuery(
    api.chats.searchChats,
    searchQuery.trim() && currentMode === 'chat' ? { query: searchQuery } : 'skip'
  );
  
  const searchCourseResults = useQuery(
    api.course.searchChats,
    searchQuery.trim() && currentMode === 'learn' ? { query: searchQuery } : 'skip'
  );

  // Focus management
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Get filtered items based on current mode
  const getFilteredItems = () => {
    if (currentMode === 'chat') {
      const items = searchQuery.trim() ? searchChatResults || [] : (chats || []).slice(0, 10);
      return items;
    } else {
      const items = searchQuery.trim() ? searchCourseResults || [] : (courses || []).slice(0, 10);
      return items;
    }
  };

  const filteredItems = getFilteredItems();

  const handleArrowNavigation = (direction: 'up' | 'down') => {
    if (direction === 'down') {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % filteredItems.length);
    } else {
      setSelectedIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredItems.length) % filteredItems.length
      );
    }
  };

  const handleItemSelection = (itemId?: string) => {
    const selectedItem = itemId
      ? filteredItems.find((item) => item._id === itemId)
      : filteredItems[selectedIndex];
      
    if (selectedItem) {
      if (currentMode === 'chat') {
        router.push(`/learning/chat/${selectedItem._id}`);
      } else {
        // Navigate to course canvas
        router.push(`/learning/learn/${selectedItem._id}`);
      }
      onClose();
    }
  };

  const formatDate = (timestamp: number) => {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') handleArrowNavigation('down');
    if (e.key === 'ArrowUp') handleArrowNavigation('up');
    if (e.key === 'Enter') handleItemSelection();
    if (e.key === 'Escape') onClose();
    if (e.key === 'Tab') {
      e.preventDefault();
      setCurrentMode(currentMode === 'chat' ? 'learn' : 'chat');
      setSelectedIndex(0);
    }
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

        <div className="relative z-10 max-h-[80vh] w-[700px] max-w-[90vw] overflow-hidden">
          {/* Header with mode tabs */}
          <div className="border-white/20 border-b">
            {/* Mode tabs */}
            <div className="flex border-white/20 border-b">
              <button
                className={`flex-1 px-6 py-3 text-center transition-all duration-200 ${
                  currentMode === 'chat'
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
                onClick={() => {
                  setCurrentMode('chat');
                  setSelectedIndex(0);
                }}
              >
                Chat History
              </button>
              <button
                className={`flex-1 px-6 py-3 text-center transition-all duration-200 ${
                  currentMode === 'learn'
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
                onClick={() => {
                  setCurrentMode('learn');
                  setSelectedIndex(0);
                }}
              >
                Learn History
              </button>
            </div>
            
            {/* Search input */}
            <div className="p-4">
              <input
                className="w-full bg-transparent p-3 px-4 py-3 text-white outline-none backdrop-blur-sm placeholder:text-white/50"
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Search ${currentMode === 'chat' ? 'chats' : 'courses'}...`}
                ref={searchInputRef}
                type="text"
                value={searchQuery}
              />
            </div>
          </div>

          {/* Items list */}
          <div className="max-h-96 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-white/50">
                {searchQuery.trim() 
                  ? `No ${currentMode === 'chat' ? 'chats' : 'courses'} found` 
                  : `No ${currentMode === 'chat' ? 'chats' : 'courses'} available`
                }
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {filteredItems.map((item, index) => (
                  <li
                    className={`cursor-pointer px-6 py-4 transition-all duration-150 ${
                      index === selectedIndex
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10'
                    } `}
                    key={item._id}
                    onClick={() => handleItemSelection(item._id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Icon based on mode */}
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                            {currentMode === 'chat' ? (
                              <span className="text-sm">💬</span>
                            ) : (
                              <span className="text-sm">📚</span>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-light text-lg">
                              {currentMode === 'chat' && isChat(item)
                                ? truncateText(item.title, 50)
                                : currentMode === 'learn' && isCourse(item)
                                ? truncateText(item.prompt, 50)
                                : 'Unknown item'
                              }
                            </p>
                            <p className="text-sm text-white/60">
                              {currentMode === 'chat' && isChat(item)
                                ? `${item.model?.split("/").pop() || "Unknown model"} • ${formatDate(item.updatedAt)}`
                                : currentMode === 'learn' && isCourse(item)
                                ? `${item.stages?.length || 0} stages • ${formatDate(item.createdAt)}`
                                : 'Unknown details'
                              }
                            </p>
                          </div>
                        </div>
                        
                        {currentMode === 'chat' && isChat(item) && item.pinned && (
                          <span className="text-sm text-yellow-400">📌</span>
                        )}
                      </div>
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
              <kbd className="rounded bg-white/10 px-2 py-1 text-xs">Tab</kbd> to switch modes,
              <kbd className="ml-1 rounded bg-white/10 px-2 py-1 text-xs">↑↓</kbd> to navigate,
              <kbd className="ml-1 rounded bg-white/10 px-2 py-1 text-xs">Enter</kbd> to select,
              <kbd className="ml-1 rounded bg-white/10 px-2 py-1 text-xs">Esc</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCommandPalette;
