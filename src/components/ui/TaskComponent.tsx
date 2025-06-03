"use client";
import React, { useState, useRef } from "react";
import useSWR, { mutate, SWRResponse } from "swr";
import { Plus, Check, ChevronLeft } from "lucide-react";

interface TaskTypes {
  id: string;
  text: string;
  completed: boolean | string;
}

const fetcher = async (): Promise<TaskTypes[]> => {
  const response = await fetch("/api/userTasks");
  if (!response.ok) throw new Error("Failed to fetch tasks");
  const data = (await response.json()) as TaskTypes[];

  return data.map((task) => ({
    ...task,
    completed: typeof task.completed === "string"
      ? task.completed.toLowerCase() === "true"
      : Boolean(task.completed),
  })).filter((task) => !task.completed);
};

const TaskComponent = ({ onClose }: { onClose: () => void }) => {
  const { data: tasks = [], error }: SWRResponse<TaskTypes[], Error> = useSWR(
    "/api/userTasks",
    fetcher,
    { fallbackData: [] }
  );
  const [newTask, setNewTask] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);
  const [removingTask, setRemovingTask] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTask = async (taskText: string) => {
    await fetch("api/userTasks", {
      method: "POST",
      body: JSON.stringify({ task: taskText.trim() }),
      headers: { "Content-Type": "application/json" },
    });
    await mutate("/api/userTasks");
  };

  React.useEffect(() => {
    if (showInput) {
      inputRef.current?.focus();
    }
  }, [showInput]);

  const handleAddTask = async () => {
    if (newTask.trim()) {
      await addTask(newTask);
      setNewTask("");
      setShowInput(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setRemovingTask(taskId);
    await new Promise((resolve) => {
      setTimeout(async () => {
        if (!tasks) return;
        await mutate(
          "/api/userTasks",
          tasks.filter((task) => task.id !== taskId),
          false
        );
        setRemovingTask(null);
        resolve(undefined);
      }, 500);
    });
  };

  const taskComplete = async (taskId: string) => {
    await fetch("/api/userTasks", {
      method: "PATCH",
      body: JSON.stringify({ taskId }),
      headers: { "Content-Type": "application/json" },
    });
    await mutate("/api/userTasks");
  };

  const handleToggleComplete = async (taskId: string) => {
    await mutate(
      "/api/userTasks",
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      ),
      false
    );
    void handleDeleteTask(taskId);
    await taskComplete(taskId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void handleAddTask();
    }
  };

  if (error) {
    return <div>Error loading tasks</div>;
  }

  return (
    <div className=" bg-[#121212]   text-[#f7eee3] shadow-2xl backdrop-blur-xl rounded-3xl p-1 pb-12  border-[#5858583d] border-2">
      <div className=" bg-[#2a2a2a] text-[#a0a0a0] rounded-2xl w-[600px] max-w-[90vw] shadow-2xl p-4  overflow-hidden">

      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onClose}
          className="rounded-xl bg-[#0E0D0D]p-2 text-[#f7eee3]/70 transition-colors hover:text-[#f7eee3]"
          aria-label="Close"
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl text-[#f7eee3] font-serif">Tasks</h2>
      </div>

      <div className="flex-grow space-y-2 overflow-y-auto">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center justify-between p-3 transition-all duration-500 ${
              removingTask === task.id
                ? "scale-90 opacity-0"
                : task.completed
                ? "border-b-2 border-[#f7eee323] text-green-600 line-through"
                : "border-b-2 border-[#f7eee323] bg-[#000000]/0"
            }`}
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => { void handleToggleComplete(task.id); }}
                className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                  task.completed
                    ? "border-green-500/70 bg-green-500/70"
                    : "border-[#f7eee3]/30 hover:border-[#FF5E00]-400/50"
                }`}
                aria-label={`Mark task ${task.text} as complete`}
              >
                {task.completed && <Check size={16} />}
              </button>
              <span>{task.text}</span>
            </div>
            <button
              onClick={() => { void handleDeleteTask(task.id); }}
              className="rounded-full p-2 text-[#f7eee3] transition-colors hover:text-red-500"
              aria-label={`Delete task ${task.text}`}
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
            className="flex-grow rounded-xl border border-[#f7eee3]/20 bg-[#f7eee3]/10 p-3 text-[#f7eee3] placeholder:text-[#6D6D6C] backdrop-blur-md focus:outline-none"
          />
          <button
            onClick={() => { void handleAddTask(); }}
            className={`rounded-md bg-[#FF5E00]/70 p-3 text-[#f7eee3] backdrop-blur-md transition-colors ${!newTask.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#FF5E00]/90'}`}
            disabled={!newTask.trim()}
          >
            Add
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button
            onClick={() => setShowInput(true)}
            className="w-3/2 flex items-center justify-end rounded-md border-2 border-[#f7eee323] bg-[#343333] p-2 text-[#f7eee3] transition-colors hover:bg-[#FF5E00]/90"
            aria-label="Add new task"
          >
            <Plus size={20} />
          </button>
        </div>
      )}
      </div>
    </div>
  );
};

export default TaskComponent;
