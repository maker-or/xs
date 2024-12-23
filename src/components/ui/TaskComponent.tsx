'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Check, ChevronLeft } from 'lucide-react';





 const TaskComponent = ({ onClose }: { onClose: () => void }) => {
    const [tasks, setTasks] = useState<
      { id: string; text: string; completed: boolean }[]
    >([
      { id: `task-1`, text: "Complete the todo list", completed: false },
      { id: `task-2`, text: "Review React components", completed: false },
      { id: `task-3`, text: "Learn Tailwind CSS", completed: false },
    ]);
    const [newTask, setNewTask] = useState<string>("");
    const [showInput, setShowInput] = useState<boolean>(false);
    const [removingTask, setRemovingTask] = useState<string | null>(null); // Track the task being removed
    const inputRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => {
      if (showInput) {
        inputRef.current?.focus();
      }
    }, [showInput]);
  
    const handleAddTask = () => {
      if (newTask.trim()) {
        setTasks([
          ...tasks,
          { id: `task-${Date.now()}`, text: newTask.trim(), completed: false },
        ]);
        setNewTask("");
        setShowInput(false);
      }
    };
  
    const handleDeleteTask = (taskId: string) => {
      setRemovingTask(taskId); // Set the task to be removed
      setTimeout(() => {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
        setRemovingTask(null); // Clear the removing state
      }, 500); // Delay for animation
    };
  
    const handleToggleComplete = (taskId: string) => {
      setTasks(
        tasks.map((task) =>
          task.id === taskId
            ? { ...task, completed: true }
            : task
        )
      );
      handleDeleteTask(taskId); // Trigger the deletion after marking complete
    };
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleAddTask();
      }
    };
  
    return (
      <div className="bg-[#0c0c0c]/60 backdrop-blur-xl text-[#f7eee3] rounded-3xl p-6 w-1/2 max-h-[500px] flex flex-col shadow-2xl border border-[#f7eee3]/20 relative overflow-hidden">
        {/* Glassmorphic background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0c0c]/10 to-[#0c0c0c]/5 opacity-50 -z-10 blur-3xl"></div>
  
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onClose}
            className="text-[#f7eee3]/70 hover:text-[#f7eee3] transition-colors bg-[#f7eee3]/10 rounded-full p-2"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl text-[#f7eee3]">Tasks</h2>
        </div>
  
        <div className="overflow-y-auto space-y-2 flex-grow">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-3 transition-all duration-500 ${removingTask === task.id
                  ? "opacity-0 scale-90" // Fading out and shrinking animation
                  : task.completed
                    ? "line-through border-b-2 border-[#f7eee323] text-green-600"
                    : "bg-[#0c0c0c]/0 border-b-2 border-[#f7eee323]"
                }`}
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleToggleComplete(task.id)}
                  className={`w-6 h-6 rounded-md border flex items-center justify-center ${task.completed
                      ? "bg-green-500/70 border-green-500/70"
                      : "border-[#f7eee3]/30 hover:border-orange-400/50"
                    }`}
                >
                  {task.completed && <Check size={16} />}
                </button>
                <span>{task.text}</span>
              </div>
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="text-[#f7eee3] hover:text-red-500 transition-colors rounded-full p-2"
              >
                {/* <Trash2 size={18} /> */}
              </button>
            </div>
          ))}
        </div>
  
        {showInput ? (
          <div className="mt-4 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter new task"
              className="flex-grow p-3 bg-[#f7eee3]/10 backdrop-blur-md text-[#f7eee3] rounded-xl border border-[#f7eee3]/20 focus:outline-none"
            />
            <button
              onClick={handleAddTask}
              className="bg-orange-600/70 backdrop-blur-md text-[#f7eee3] p-3 rounded-md hover:bg-orange-600/90 transition-colors"
            >
              Add
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <button
              onClick={() => setShowInput(true)}
              className="bg-[#343333] border-2 border-[#f7eee323] text-[#f7eee3] p-2 rounded-md flex items-center justify-end hover:bg-orange-600/90 transition-colors w-3/2"
            >
              <Plus size={20} />
            </button>
          </div>
        )}
      </div>
    );
  };

  export default TaskComponent