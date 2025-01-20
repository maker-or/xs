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
const response = await fetch("/api/userTasks/");
if (!response.ok) throw new Error("Failed to fetch tasks");
const data = (await response.json()) as TaskTypes[];

// Transform the data
const updatedTasks = data.map((task: TaskTypes) => ({
    ...task,
    completed:
    typeof task.completed === "string"
        ? task.completed.toLowerCase() === "true"
        : Boolean(task.completed),
}));

  return updatedTasks.filter((task) => task.completed === false);
};

const TaskComponent = ({ onClose }: { onClose: () => void }) => {
const { data: tasks = [], error }: SWRResponse<TaskTypes[], Error> = useSWR("/api/userTasks", fetcher, {
    fallbackData: [],
});
  const [newTask, setNewTask] = useState<string>("");
  const [showInput, setShowInput] = useState<boolean>(false);
  const [removingTask, setRemovingTask] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTask = async (taskText: string) => {
    await fetch("api/userTasks", {
      method: "POST",
      body: JSON.stringify({ task: taskText.trim() }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    await mutate("/api/userTasks"); // Revalidate the tasks list
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
      headers: {
        "Content-Type": "application/json",
      },
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
    <div className="relative flex max-h-[500px] w-1/2 flex-col overflow-hidden rounded-3xl border border-[#f7eee3]/20 bg-[#0c0c0c]/60 p-6 text-[#f7eee3] shadow-2xl backdrop-blur-xl">
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
                ? "scale-90 opacity-0"
                : task.completed
                ? "border-b-2 border-[#f7eee323] text-green-600 line-through"
                : "border-b-2 border-[#f7eee323] bg-[#0c0c0c]/0"
            }`}
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => { void handleToggleComplete(task.id); }}
                className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                  task.completed
                    ? "border-green-500/70 bg-green-500/70 motion-preset-confetti motion-duration-1000"
                    : "border-[#f7eee3]/30 hover:border-[#FF5E00]-400/50"
                }`}
              >
                {task.completed && <Check size={16} />}
              </button>
              <span>{task.text}</span>
            </div>
            <button
            onClick={() => { void handleDeleteTask(task.id); }}
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
            onClick={() => { void handleAddTask(); }}
            className="rounded-md bg-[#FF5E00]/70 p-3 text-[#f7eee3] backdrop-blur-md transition-colors hover:bg-[#FF5E00]/90"
          >
            Add
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <button
            onClick={() => setShowInput(true)}
            className="w-3/2 flex items-center justify-end rounded-md border-2 border-[#f7eee323] bg-[#343333] p-2 text-[#f7eee3] transition-colors hover:bg-[#FF5E00]/90"
          >
            <Plus size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskComponent;