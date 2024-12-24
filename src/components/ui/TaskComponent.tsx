"use client";
import React, { useState, useEffect, useRef } from "react";
import { Plus, Check, ChevronLeft } from "lucide-react";

interface TaskTypes {
  id: string;
  text: string;
  completed: boolean | string;
}

const TaskComponent = ({ onClose }: { onClose: () => void }) => {
  const [tasks, setTasks] = useState<TaskTypes[]>([
    // { id: `task-1`, text: "Complete the todo list", completed: false },
    // { id: `task-2`, text: "Review React components", completed: false },
    // { id: `task-3`, text: "Learn Tailwind CSS", completed: false },
  ]);
  const [newTask, setNewTask] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);
  const [removingTask, setRemovingTask] = useState<string | null>(null); // Track the task being removed
  const inputRef = useRef<HTMLInputElement>(null);

  const addTask = async () => {
    await fetch("api/userTasks", {
      method: "POST",
      body: JSON.stringify({ task: newTask.trim() }),
    });
  };

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
    addTask();
  };

  useEffect(() => {
    const getTasks = async () => {
      await fetch("/api/userTasks/")
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          const updatedTasks = res.map((task: TaskTypes) => ({
            ...task,
            completed:
              typeof task.completed === "string"
                ? task.completed.toLowerCase() === "true"
                : task.completed,
          }));

          const filteredTasks = updatedTasks.filter(
            (task: TaskTypes) => task.completed === false,
          );

          setTasks(filteredTasks);
        });
    };
    getTasks();
  }, []);

  const handleDeleteTask = (taskId: string) => {
    setRemovingTask(taskId); // Set the task to be removed
    setTimeout(() => {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setRemovingTask(null); // Clear the removing state
    }, 500); // Delay for animation
  };

  const taskComplete = async (taskId: string) => {
    await fetch("/api/userTasks", {
      method: "PATCH",
      body: JSON.stringify({ taskId }),
    });
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task,
      ),
    );
    handleDeleteTask(taskId); // Trigger the deletion after marking complete
    taskComplete(taskId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  return (
    <div className="relative flex max-h-[500px] w-1/2 flex-col overflow-hidden rounded-3xl border border-[#f7eee3]/20 bg-[#0c0c0c]/60 p-6 text-[#f7eee3] shadow-2xl backdrop-blur-xl">
      {/* Glassmorphic background effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0c0c0c]/10 to-[#0c0c0c]/5 opacity-50 blur-3xl"></div>

      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onClose}
          className="rounded-full bg-[#f7eee3]/10 p-2 text-[#f7eee3]/70 transition-colors hover:text-[#f7eee3]"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl text-[#f7eee3]">Tasks</h2>
      </div>

      <div className="flex-grow space-y-2 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-3 transition-all duration-500 ${
              removingTask === task.id
                ? "scale-90 opacity-0" // Fading out and shrinking animation
                : task.completed
                  ? "border-b-2 border-[#f7eee323] text-green-600 line-through"
                  : "border-b-2 border-[#f7eee323] bg-[#0c0c0c]/0"
            }`}
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleToggleComplete(task.id)}
                className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                  task.completed
                    ? "border-green-500/70 bg-green-500/70"
                    : "border-[#f7eee3]/30 hover:border-orange-400/50"
                }`}
              >
                {task.completed && <Check size={16} />}
              </button>
              <span>{task.text}</span>
            </div>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="rounded-full p-2 text-[#f7eee3] transition-colors hover:text-red-500"
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
            className="flex-grow rounded-xl border border-[#f7eee3]/20 bg-[#f7eee3]/10 p-3 text-[#f7eee3] backdrop-blur-md focus:outline-none"
          />
          <button
            onClick={handleAddTask}
            className="rounded-md bg-orange-600/70 p-3 text-[#f7eee3] backdrop-blur-md transition-colors hover:bg-orange-600/90"
          >
            Add
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button
            onClick={() => setShowInput(true)}
            className="w-3/2 flex items-center justify-end rounded-md border-2 border-[#f7eee323] bg-[#343333] p-2 text-[#f7eee3] transition-colors hover:bg-orange-600/90"
          >
            <Plus size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskComponent;
