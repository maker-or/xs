'use client';
import { authClient } from '../../../lib/auth-client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import PomodoroComponent from '~/components/ui/PomodoroComponent';
import TaskComponent from '~/components/ui/TaskComponent';
import ExamStatus from './ExamStatus';
// import ChatComponent from '~/components/ui/ChatComponent';
import Filesearch from './Filesearch';
import '~/styles/globals.css';

const Logout = () => {
  return (
    <button
      className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white hover:bg-white/20"
      onClick={() => authClient.signOut()}
      type="button"
    >
      Sign out
    </button>
  );
};

const CommandPlate = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeView, setActiveView] = useState<
    | 'commands'
    | 'task'
    | 'timer'
    | 'Sphere Intelligence'
    | 'logout'
    | 'Filesearch'
    | 'examStatus'
  >('commands');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const commands = [
    {
      name: 'Task',
      shortcut: '⌘ T',
      icon: 'check',
      handler: () => setActiveView('task'),
    },
    {
      name: 'Timer',
      shortcut: '⌘ I',
      icon: 'clock',
      handler: () => setActiveView('timer'),
    },
    // { name: 'Sphere Intelligence', shortcut: '⌘ S', icon: 'globe', handler: () => setActiveView('Sphere Intelligence') },
    {
      name: 'Logout',
      shortcut: '⌘ ,',
      icon: 'settings',
      handler: () => setActiveView('logout'),
    },
    {
      name: 'File Search',
      shortcut: '⌘ ,',
      icon: 'File Searh',
      handler: () => setActiveView('Filesearch'),
    },
    {
      name: 'Exam Status',
      shortcut: '⌘ E',
      icon: 'exam',
      handler: () => setActiveView('examStatus'),
    },
    // { name: 'Self Test', shortcut: '⌘ S', icon: 'test', handler: () => {
    //   setIsOpen(false);
    //   router.push('/test');
    // } },
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
      setSelectedIndex(
        (prevIndex) => (prevIndex + 1) % filteredCommands.length
      );
    } else {
      setSelectedIndex(
        (prevIndex) =>
          (prevIndex - 1 + filteredCommands.length) % filteredCommands.length
      );
    }
  };

  // Enhanced mouse click handling
  const handleCommandSelection = (command?: {
    name: string;
    handler: () => void;
  }) => {
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
    }
    if (activeView === 'timer') {
      return (
        <PomodoroComponent
        // onClose={() => {
        //   setActiveView('commands');
        //   setSearchQuery('');
        // }}
        />
      );
    }

    // else if (activeView === 'Sphere Intelligence') {
    //   return (
    //     <ChatComponent
    //       onClose={() => {
    //         setActiveView('commands');
    //         setSearchQuery('');
    //       }}
    //     />
    //   );
    // }
    if (activeView === 'Filesearch') {
      return (
        <Filesearch
          onClose={() => {
            setActiveView('commands');
            setSearchQuery('');
          }}
        />
      );
    }
    if (activeView === 'examStatus') {
      return (
        <div className="rounded-3xl border-2 border-[#5858583d] bg-[#121212] p-1 pb-12">
          <div className="w-[600px] max-w-[90vw] overflow-hidden rounded-2xl bg-[#2a2a2a] p-3 text-[#a0a0a0] shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-xl">Exam Status</h2>

              <button
                className="text-[#f7eee3] transition-colors hover:text-[#FF5E00]"
                onClick={() => {
                  setActiveView('commands');
                  setSearchQuery('');
                }}
              >
                Close
              </button>
            </div>

            <ExamStatus />
          </div>
        </div>
      );
    }
    if (activeView === 'logout') {
      return <Logout />;
    }

    return (
      <div className="rounded-3xl border-2 border-[#5858583d] bg-[#121212] p-1 pb-12">
        <div className="w-[600px] max-w-[90vw] overflow-hidden rounded-2xl bg-[#2a2a2a] text-[#a0a0a0] shadow-2xl">
          <div className="p-3">
            <input
              className="w-full border-none bg-transparent px-2 py-3 text-[#a0a0a0] text-lg placeholder:text-[#666666] placeholder:text-lg focus:outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') handleArrowNavigation('down');
                if (e.key === 'ArrowUp') handleArrowNavigation('up');
                if (e.key === 'Enter') handleCommandSelection();
              }}
              placeholder="type there..."
              ref={searchInputRef}
              type="text"
              value={searchQuery}
            />
          </div>

          <div className="border-[#404040] border-t">
            <ul className="max-h-80 overflow-y-auto">
              {filteredCommands.length === 0 ? (
                <li className="px-4 py-6 text-center text-[#666666]">
                  No commands found
                </li>
              ) : (
                filteredCommands.map((command, index) => (
                  <li
                    className={`cursor-pointer px-4 py-3 text-[#a0a0a0] text-lg transition-all duration-150 ${
                      index === selectedIndex
                        ? 'bg-[#404040] text-[#ffffff]'
                        : 'hover:bg-[#353535]'
                    } `}
                    key={command.name}
                    onClick={() => handleCommandSelection(command)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{command.name}</span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
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
