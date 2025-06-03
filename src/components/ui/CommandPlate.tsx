'use client'
import React, { useState, useEffect, useRef } from 'react';
import { SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import TaskComponent from '~/components/ui/TaskComponent';
import PomodoroComponent from '~/components/ui/PomodoroComponent';
// import ChatComponent from '~/components/ui/ChatComponent';
import Filesearch from './Filesearch';
import ExamStatus from './ExamStatus';
import "~/styles/globals.css";


const Logout = () => {
  return <SignOutButton />
}



const CommandPlate = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeView, setActiveView] = useState<'commands' | 'task' | 'timer' | 'Sphere Intelligence' | 'logout' | 'Filesearch' | 'examStatus'>('commands');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { name: 'Task', shortcut: '⌘ T', icon: 'check', handler: () => setActiveView('task') },
    { name: 'Timer', shortcut: '⌘ I', icon: 'clock', handler: () => setActiveView('timer') },
    // { name: 'Sphere Intelligence', shortcut: '⌘ S', icon: 'globe', handler: () => setActiveView('Sphere Intelligence') },
    { name: 'Logout', shortcut: '⌘ ,', icon: 'settings', handler: () => setActiveView('logout') },
    { name: 'File Search', shortcut: '⌘ ,', icon: 'File Searh', handler: () => setActiveView('Filesearch') },
    { name: 'Exam Status', shortcut: '⌘ E', icon: 'exam', handler: () => setActiveView('examStatus') },
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
    else if (activeView === 'examStatus') {
      return (
        <div className="bg-[#121212] rounded-3xl p-1 pb-12  border-[#5858583d] border-2">
          <div className="bg-[#2a2a2a] text-[#a0a0a0] rounded-2xl w-[600px] max-w-[90vw] shadow-2xl  overflow-hidden p-3">
            <div className='flex justify-between items-center mb-4'>
              <h2 className="text-xl font-bold">Exam Status</h2>

         
            <button
              onClick={() => {
                setActiveView('commands');
                setSearchQuery('');
              }}
              className="text-[#f7eee3] hover:text-[#FF5E00] transition-colors"
            >
              Close
            </button>
            </div>
            
                <ExamStatus />
          </div>
         
        </div>
      );
    }
    else if (activeView === 'logout') {
      return (
        <Logout/>
      );
    }





    return (
      <div className='bg-[#121212] rounded-3xl p-1 pb-12  border-[#5858583d] border-2' >
      <div className="bg-[#2a2a2a] text-[#a0a0a0] rounded-2xl w-[600px] max-w-[90vw] shadow-2xl  overflow-hidden">
        <div className="p-3">
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
            placeholder="type there..."
            className="w-full px-2 py-3 bg-transparent border-none text-[#a0a0a0] text-lg focus:outline-none placeholder:text-[#666666] placeholder:text-lg"
          />
        </div>

        <div className="border-t border-[#404040]">
          <ul className="max-h-80 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <li className="text-[#666666] text-center px-4 py-6">No commands found</li>
            ) : (
              filteredCommands.map((command, index) => (
                <li
                  key={command.name}
                  className={`
                    px-4 py-3 cursor-pointer transition-all duration-150 text-[#a0a0a0] text-lg
                    ${index === selectedIndex
                      ? 'bg-[#404040] text-[#ffffff]'
                      : 'hover:bg-[#353535]'
                    }
                  `}
                  onClick={() => handleCommandSelection(command)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex justify-between items-center">
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