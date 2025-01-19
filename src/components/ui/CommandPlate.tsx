'use client'
import React, { useState, useEffect, useRef } from 'react';
import { SignOutButton } from '@clerk/nextjs';
import TaskComponent from '~/components/ui/TaskComponent'; 
import PomodoroComponent from '~/components/ui/PomodoroComponent'; 
import ChatComponent from '~/components/ui/ChatComponent'; 
import Filesearch from './Filesearch';
import "~/styles/globals.css";


const Logout = () => {
  return <SignOutButton />
}



const CommandPlate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeView, setActiveView] = useState<'commands' | 'task' | 'timer' | 'Sphere Intelligence' | 'logout' | 'Filesearch'>('commands');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { name: 'Task', shortcut: '⌘ T', icon: 'check', handler: () => setActiveView('task') },
    { name: 'Timer', shortcut: '⌘ I', icon: 'clock', handler: () => setActiveView('timer') },
    { name: 'Sphere Intelligence', shortcut: '⌘ S', icon: 'globe', handler: () => setActiveView('Sphere Intelligence') },
    { name: 'Logout', shortcut: '⌘ ,', icon: 'settings', handler: () => setActiveView('logout') },
    { name: 'File Search', shortcut: '⌘ ,', icon: 'File Searh', handler: () => setActiveView('Filesearch') },
  ];

  // Focus management and keyboard shortcuts [unchanged]
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setActiveView('commands');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredCommands = commands.filter((command) =>
    command.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleArrowNavigation = (direction: 'up' | 'down') => {
    if (direction === 'down') {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % filteredCommands.length);
    } else {
      setSelectedIndex((prevIndex) => (prevIndex - 1 + filteredCommands.length) % filteredCommands.length);
    }
  };

  // Enhanced mouse click handling
  const handleCommandSelection = (command?: { name: string; handler: () => void }) => {
    if (command) {
      command.handler();
    } else {
      const selectedCommand = filteredCommands[selectedIndex];
      selectedCommand?.handler();
    }
    
    // Optional: clear search query after selection
    setSearchQuery('');
  };

  const renderContent = () => {
    if (activeView === 'task') {
      return (
        <TaskComponent
          onClose={() => {
            setActiveView('commands');
            setSearchQuery('');
          }}
        />
      );
    } else if (activeView === 'timer') {
      return (
        <PomodoroComponent
          // onClose={() => {
          //   setActiveView('commands');
          //   setSearchQuery('');
          // }}
        />
      );
    }
    else if (activeView === 'Sphere Intelligence') {
      return (
        <ChatComponent
          onClose={() => {
            setActiveView('commands');
            setSearchQuery('');
          }}
        />
      );
    }
    else if (activeView === 'Filesearch') {
      return (
        <Filesearch
          onClose={() => {
            setActiveView('commands');
            setSearchQuery('');
          }}
        />
      );
    }
    

    else if (activeView === 'logout') {
      return (
        <Logout/>
      );
    }

    return (
      <div className="bg-[#0c0c0ce0] backdrop-blur-3xl text-[#e1ddd6] rounded-xl py-3 w-1/2 shadow-2xl border border-[#f7eee338] inner  overflow-hidden ">
        <div className="flex gap-2 border-[#f7eee338] w-full text-[#0c0c0c] ">
          {/* <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f7eee3] p-2 bg-[#0c0c0c] z-10 rounded-sm"
            size={38}
          /> */}
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") handleArrowNavigation("down");
              if (e.key === "ArrowUp") handleArrowNavigation("up");
              if (e.key === "Enter") handleCommandSelection();
            }}
            
            placeholder="Search Anything..."
            className="w-full pl-2 p-4 border-none bg-[#F7EEE3] m-3 backdrop-blur-3xl text-[#3d3c3a] rounded-xl border border-[#f7eee3]/20 focus:outline-none placeholder:text-[#f7eee3] i1 i2"
          />
        </div>

        <ul className="max-h-80 overflow-y-auto space-y-2 m-2">
          {filteredCommands.length === 0 ? (
            <li className="text-[#f7eee3]/50 text-center px-3 py-4">No commands found</li>
          ) : (
            filteredCommands.map((command, index) => (
              <li
                key={command.name}
                className={`
                  p-3 cursor-pointer transition-all duration-200
                  ${index === selectedIndex
                    ? 'text-orange-500 rounded-sm bg-[#f7eee3]/10'
                    : 'hover:bg-[#f7eee3]/10'
                  }
                `}
                // Add explicit mouse click handler for each command
                onClick={() => handleCommandSelection(command)}
                // Improved keyboard navigation
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex justify-between items-center">
                  <span>{command.name}</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c0c]/60"
      onClick={(e) => {
        // Close command plate when clicking outside the content
        if (e.target === e.currentTarget) {
          setIsOpen(false);
          setActiveView('commands');
        }
      }}
    >
      {renderContent()}
    </div>
  );
};

export default CommandPlate;