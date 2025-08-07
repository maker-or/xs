'use client';
import { Check, ChevronLeft, Plus } from 'lucide-react';
import React, { useRef, useState } from 'react';
import useSWR, { mutate, type SWRResponse } from 'swr';

interface TaskTypes {
  id: string;
  text: string;
  completed: boolean | string;
}

const fetcher = async (): Promise<TaskTypes[]> => {
  const response = await fetch('/api/userTasks');
  if (!response.ok) throw new Error('Failed to fetch tasks');
  const data = (await response.json()) as TaskTypes[];

  return data
    .map((task) => ({
      ...task,
      completed:
        typeof task.completed === 'string'
          ? task.completed.toLowerCase() === 'true'
          : Boolean(task.completed),
    }))
    .filter((task) => !task.completed);
};

const TaskComponent = ({ onClose }: { onClose: () => void }) => {
  const { data: tasks = [], error }: SWRResponse<TaskTypes[], Error> = useSWR(
    '/api/userTasks',
    fetcher,
    { fallbackData: [] }
  );
  const [newTask, setNewTask] = useState<string>('');
  const [showInput, setShowInput] = useState<boolean>(false);
  const [removingTask, setRemovingTask] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTask = async (taskText: string) => {
    await fetch('api/userTasks', {
      method: 'POST',
      body: JSON.stringify({ task: taskText.trim() }),
      headers: { 'Content-Type': 'application/json' },
    });
    await mutate('/api/userTasks');
  };

  React.useEffect(() => {
    if (showInput) {
      inputRef.current?.focus();
    }
  }, [showInput]);

  const handleAddTask = async () => {
    if (newTask.trim()) {
      await addTask(newTask);
      setNewTask('');
      setShowInput(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setRemovingTask(taskId);
    await new Promise((resolve) => {
      setTimeout(async () => {
        if (!tasks) return;
        await mutate(
          '/api/userTasks',
          tasks.filter((task) => task.id !== taskId),
          false
        );
        setRemovingTask(null);
        resolve(undefined);
      }, 500);
    });
  };

  const taskComplete = async (taskId: string) => {
    await fetch('/api/userTasks', {
      method: 'PATCH',
      body: JSON.stringify({ taskId }),
      headers: { 'Content-Type': 'application/json' },
    });
    await mutate('/api/userTasks');
  };

  const handleToggleComplete = async (taskId: string) => {
    await mutate(
      '/api/userTasks',
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      ),
      false
    );
    void handleDeleteTask(taskId);
    await taskComplete(taskId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      void handleAddTask();
    }
  };

  if (error) {
    return <div>Error loading tasks</div>;
  }

  return (
    <div className=" rounded-3xl border-2 border-[#5858583d] bg-[#121212] p-1 pb-12 text-[#f7eee3] shadow-2xl backdrop-blur-xl">
      <div className=" w-[600px] max-w-[90vw] overflow-hidden rounded-2xl bg-[#2a2a2a] p-4 text-[#a0a0a0] shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            aria-label="Close"
            className="rounded-xl bg-[#0E0D0D]p-2 text-[#f7eee3]/70 transition-colors hover:text-[#f7eee3]"
            onClick={onClose}
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="font-serif text-2xl text-[#f7eee3]">Tasks</h2>
        </div>

        <div className="flex-grow space-y-2 overflow-y-auto">
          {tasks.map((task) => (
            <div
              className={`flex items-center justify-between p-3 transition-all duration-500 ${
                removingTask === task.id
                  ? 'scale-90 opacity-0'
                  : task.completed
                    ? 'border-[#f7eee323] border-b-2 text-green-600 line-through'
                    : 'border-[#f7eee323] border-b-2 bg-[#000000]/0'
              }`}
              key={task.id}
            >
              <div className="flex items-center space-x-3">
                <button
                  aria-label={`Mark task ${task.text} as complete`}
                  className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                    task.completed
                      ? 'border-green-500/70 bg-green-500/70'
                      : 'border-[#f7eee3]/30 hover:border-[#FF5E00]-400/50'
                  }`}
                  onClick={() => {
                    void handleToggleComplete(task.id);
                  }}
                >
                  {task.completed && <Check size={16} />}
                </button>
                <span>{task.text}</span>
              </div>
              <button
                aria-label={`Delete task ${task.text}`}
                className="rounded-full p-2 text-[#f7eee3] transition-colors hover:text-red-500"
                onClick={() => {
                  void handleDeleteTask(task.id);
                }}
              >
                {/* <Trash2 size={18} /> */}
              </button>
            </div>
          ))}
        </div>

        {showInput ? (
          <div className="mt-4 flex gap-2">
            <input
              className="flex-grow rounded-xl border border-[#f7eee3]/20 bg-[#f7eee3]/10 p-3 text-[#f7eee3] backdrop-blur-md placeholder:text-[#6D6D6C] focus:outline-none"
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter new task"
              ref={inputRef}
              type="text"
              value={newTask}
            />
            <button
              className={`rounded-md bg-[#FF5E00]/70 p-3 text-[#f7eee3] backdrop-blur-md transition-colors ${newTask.trim() ? 'hover:bg-[#FF5E00]/90' : 'cursor-not-allowed opacity-50'}`}
              disabled={!newTask.trim()}
              onClick={() => {
                void handleAddTask();
              }}
            >
              Add
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <button
              aria-label="Add new task"
              className="flex w-3/2 items-center justify-end rounded-md border-2 border-[#f7eee323] bg-[#343333] p-2 text-[#f7eee3] transition-colors hover:bg-[#FF5E00]/90"
              onClick={() => setShowInput(true)}
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
