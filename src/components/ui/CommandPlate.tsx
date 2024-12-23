'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
// import { useChat } from 'ai/react';
import { SignOutButton } from '@clerk/nextjs';
import TaskComponent from '~/components/ui/TaskComponent'; 
import  PomodoroComponent  from '~/components/ui/PomodoroComponent'; 
import ChatComponent from '~/components/ui/ChatComponent';  

// const TaskComponent = ({ onClose }: { onClose: () => void }) => {
//   const [tasks, setTasks] = useState<
//     { id: string; text: string; completed: boolean }[]
//   >([
//     { id: `task-1`, text: "Complete the todo list", completed: false },
//     { id: `task-2`, text: "Review React components", completed: false },
//     { id: `task-3`, text: "Learn Tailwind CSS", completed: false },
//   ]);
//   const [newTask, setNewTask] = useState<string>("");
//   const [showInput, setShowInput] = useState<boolean>(false);
//   const [removingTask, setRemovingTask] = useState<string | null>(null); // Track the task being removed
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (showInput) {
//       inputRef.current?.focus();
//     }
//   }, [showInput]);

//   const handleAddTask = () => {
//     if (newTask.trim()) {
//       setTasks([
//         ...tasks,
//         { id: `task-${Date.now()}`, text: newTask.trim(), completed: false },
//       ]);
//       setNewTask("");
//       setShowInput(false);
//     }
//   };

//   const handleDeleteTask = (taskId: string) => {
//     setRemovingTask(taskId); // Set the task to be removed
//     setTimeout(() => {
//       setTasks((prev) => prev.filter((task) => task.id !== taskId));
//       setRemovingTask(null); // Clear the removing state
//     }, 500); // Delay for animation
//   };

//   const handleToggleComplete = (taskId: string) => {
//     setTasks(
//       tasks.map((task) =>
//         task.id === taskId
//           ? { ...task, completed: true }
//           : task
//       )
//     );
//     handleDeleteTask(taskId); // Trigger the deletion after marking complete
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       handleAddTask();
//     }
//   };

//   return (
//     <div className="bg-[#0c0c0c]/60 backdrop-blur-2xl text-[#f7eee3] rounded-3xl p-6 w-1/2 max-h-[500px] flex flex-col shadow-2xl border border-[#f7eee3]/20 relative overflow-hidden">
//       {/* Glassmorphic background effect */}
//       <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c]/10 to-[#0c0c0c]/5 opacity-50 -z-10 blur-3xl"></div>

//       <div className="flex justify-between items-center mb-6">
//         <button
//           onClick={onClose}
//           className="text-[#f7eee3]/70 hover:text-[#f7eee3] transition-colors bg-[#f7eee3]/10 rounded-full p-2"
//         >
//           <ChevronLeft size={24} />
//         </button>
//         <h2 className="text-2xl text-[#f7eee3]">Tasks</h2>
//       </div>

//       <div className="overflow-y-auto space-y-2 flex-grow">
//         {tasks.map((task) => (
//           <div
//             key={task.id}
//             className={`flex items-center justify-between p-3 transition-all duration-500 ${removingTask === task.id
//                 ? "opacity-0 scale-90" // Fading out and shrinking animation
//                 : task.completed
//                   ? "line-through border-b-2 border-[#f7eee323] text-green-600"
//                   : "bg-[#0c0c0c]/0 border-b-2 border-[#f7eee323]"
//               }`}
//           >
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={() => handleToggleComplete(task.id)}
//                 className={`w-6 h-6 rounded-md border flex items-center justify-center ${task.completed
//                     ? "bg-green-500/70 border-green-500/70"
//                     : "border-[#f7eee3]/30 hover:border-orange-400/50"
//                   }`}
//               >
//                 {task.completed && <Check size={16} />}
//               </button>
//               <span>{task.text}</span>
//             </div>
//             <button
//               onClick={() => handleDeleteTask(task.id)}
//               className="text-[#f7eee3] hover:text-red-500 transition-colors rounded-full p-2"
//             >
//               {/* <Trash2 size={18} /> */}
//             </button>
//           </div>
//         ))}
//       </div>

//       {showInput ? (
//         <div className="mt-4 flex gap-2">
//           <input
//             ref={inputRef}
//             type="text"
//             value={newTask}
//             onChange={(e) => setNewTask(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder="Enter new task"
//             className="flex-grow p-3 bg-[#f7eee3]/10 backdrop-blur-md text-[#f7eee3] rounded-xl border border-[#f7eee3]/20 focus:outline-none"
//           />
//           <button
//             onClick={handleAddTask}
//             className="bg-orange-600/70 backdrop-blur-md text-[#f7eee3] p-3 rounded-md hover:bg-orange-600/90 transition-colors"
//           >
//             Add
//           </button>
//         </div>
//       ) : (
//         <div className="mt-4">
//           <button
//             onClick={() => setShowInput(true)}
//             className="bg-[#343333] border-2 border-[#f7eee323] text-[#f7eee3] p-2 rounded-md flex items-center justify-end hover:bg-orange-600/90 transition-colors w-3/2"
//           >
//             <Plus size={20} />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

const Logout = () => {
  return <SignOutButton />
}


// const PomodoroComponent = ({ onClose }: { onClose: () => void }) => {
//   const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
//   const [isRunning, setIsRunning] = useState<boolean>(false);
//   const [completedSessions, setCompletedSessions] = useState<number>(0);

//   // Timer logic
//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (isRunning && timeLeft > 0) {
//       timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
//     } else if (timeLeft === 0) {
//       setIsRunning(false);
//       setCompletedSessions((prev) => prev + 1);
//     }
//     return () => clearInterval(timer);
//   }, [isRunning, timeLeft]);

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const handleStartPause = () => setIsRunning((prev) => !prev);
//   const handleReset = () => {
//     setTimeLeft(25 * 60);
//     setIsRunning(false);
//   };

//   return (
//     <div className="bg-[#0c0c0c]/60 backdrop-blur-2xl text-[#f7eee3] rounded-3xl p-6 w-1/2 max-h-[400px] flex flex-col shadow-2xl border border-[#f7eee3]/20 relative overflow-hidden">
//       {/* Glassmorphic background effect */}
//       <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c]/10 to-[#0c0c0c]/5 opacity-50 -z-10 blur-3xl"></div>

//       <div className="flex justify-between items-center mb-6">
//         <button
//           onClick={onClose}
//           className="text-[#f7eee3]/70 hover:text-[#f7eee3] transition-colors bg-[#f7eee3]/10 rounded-full p-2"
//         >
//           <ChevronLeft size={24} />
//         </button>

//       </div>

//       <div className="flex flex-col items-center space-y-4">
//         <div className="text-6xl font-bold">{formatTime(timeLeft)}</div>
//         <div className="flex gap-4">
//           <button
//             onClick={handleStartPause}
//             className="bg-orange-600/70 backdrop-blur-md text-[#f7eee3] px-6 py-3 rounded-md hover:bg-orange-600/90 transition-colors"
//           >
//             {isRunning ? <Pause size={20} /> : <Play size={20} />}
//           </button>
//           <button
//             onClick={handleReset}
//             className="bg-[#343333] border-2 border-[#f7eee323] text-[#f7eee3] px-6 py-3 rounded-md hover:bg-orange-600/90 transition-colors"
//           >
//             <RotateCw size={20} />
//           </button>
//         </div>
//         <div className="text-sm text-[#f7eee3]/70">Completed Sessions: {completedSessions}</div>
//       </div>
//     </div>
//   );
// };


// const ChatComponent = ({ onClose }: { onClose: () => void }) => {
//   const {
//     messages,
//     input,
//     handleInputChange,
//     handleSubmit: aiHandleSubmit,
//   } = useChat({
//     initialMessages: [],
//     api:'/api/chat/server',
//   });

//   // const [submitted, setSubmitted] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const inputRef = useRef<HTMLInputElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Focus input on component mount
//   useEffect(() => {
//     inputRef.current?.focus();
//   }, []);

//   const onSubmit = (event: React.FormEvent) => {
//     event.preventDefault();
//     if (!input.trim()) return;
//     // setSubmitted(true);

//     try {
//       aiHandleSubmit(event);
//     } catch (error) {
//       console.error('Error while submitting the message:', error);
//     }
//   };

//   return (
//     <div className="bg-[#0c0c0c]/60 backdrop-blur-2xl text-[#f7eee3] rounded-3xl p-6 w-1/2 max-h-[600px] flex flex-col shadow-2xl border font-sans border-[#f7eee3]/20 relative overflow-hidden">
//       {/* Glassmorphic background effect */}

//       <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c]/10 to-[#0c0c0c]/5 opacity-50 -z-10 blur-3xl"></div>

//       <div className="flex gap-3 items-center mb-6">
//         <button
//           onClick={onClose}
//           className="text-[#f7eee3]/70 hover:text-[#f7eee3] transition-colors bg-[#f7eee3]/10 rounded-full p-2"
//         >
//           <ChevronLeft size={24} />
//         </button>


//         <form onSubmit={onSubmit} className="mt-4 w-full flex gap-2">
//           <div className="relative mb-6 flex gap-2 w-full text-[#0c0c0c]">
//             <Search
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f7eee3] p-2 bg-[#0c0c0c] z-10 rounded-sm"
//               size={38}
//             />
//             <input
//               ref={inputRef}
//               type="text"
//               value={input}
//               onChange={handleInputChange}

//               placeholder="Search Anything..."
//               className="w-full pl-16 p-4 bg-gradient-to-r from-[#f7eee3] to-[#ABABAB] backdrop-blur-md text-[#0c0c0c] rounded-xl font-sans border-[#f7eee3]/20 focus:outline-none  placeholder:text-[#0c0c0c]"
//             />
//           </div>
//         </form>

//       </div>

//       {/* Messages Container */}
//       <div className="flex-grow overflow-y-auto   space-y-4 mb-4 pr-2">
//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={`px-3 rounded-lg max-w-[90%} ${message.role === 'user'
//                 ? ' text-[#f7eee3]/60 font-serif text-[1.8rem]'
//                 : ' text-[#f7eee3] text-[1.2rem] tracking-tight'
//               }`} 
//           >
//             {message.content}
//           </div>
//         ))}
//         <div ref={messagesEndRef} /> {/* Anchor for auto-scrolling */}
//       </div>

//       {/* Input Area */}

//     </div>
//   );
// };

const CommandPlate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeView, setActiveView] = useState<'commands' | 'task' | 'timer' | 'Sphere Intelligence' | 'logout'>('commands');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { name: 'Task', shortcut: '⌘ T', icon: 'check', handler: () => setActiveView('task') },
    { name: 'Timer', shortcut: '⌘ I', icon: 'clock', handler: () => setActiveView('timer') },
    { name: 'Sphere Intelligence', shortcut: '⌘ S', icon: 'globe', handler: () => setActiveView('Sphere Intelligence') },
    { name: 'Logout', shortcut: '⌘ ,', icon: 'settings', handler: () => setActiveView('logout') },
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
    else if (activeView === 'logout') {
      return (
        <Logout/>
      );
    }

    return (
      <div className="bg-[#0c0c0c] backdrop-blur-3xl text-[#f7eee3] rounded-xl py-3 w-1/2 shadow-2xl border border-[#f7eee338] relative overflow-hidden">
        <div className="relative mb-6 flex gap-2 border-b-2 border-[#f7eee338] w-full text-[#0c0c0c]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f7eee3] p-2 bg-[#0c0c0c] z-10 rounded-sm"
            size={38}
          />
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
            className="w-full pl-16 p-4 border-none bg-[#0c0c0c]/60 backdrop-blur-3xl text-[#f7eee3] rounded-xl border border-[#f7eee3]/20 focus:outline-none placeholder:text-[#f7eee3]"
          />
        </div>

        <ul className="max-h-60 overflow-y-auto space-y-2 m-2">
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