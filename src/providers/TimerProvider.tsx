'use client';
import type React from 'react';
import { createContext, useEffect, useState } from 'react';

// Define the context type
interface ContextType {
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
}

// Create the context with default values
export const timeContext = createContext<ContextType>({
  timeLeft: 0,
  setTimeLeft: () => {
    throw new Error('setTimeLeft must be used within a TimeProvider');
  },
  isRunning: false,
  setIsRunning: () => {
    throw new Error('setIsRunning must be used within a TimeProvider');
  },
  duration: 30,
  setDuration: () => {
    throw new Error('setDuration must be used within a TimeProvider');
  },
});

// TimeProvider component
export const TimeProvider = ({ children }: { children: React.ReactNode }) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | undefined;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;
          // setProgress((newTime / (duration * 60)) * 100);

          // if (newTime <= 0) {
          //   setIsRunning(false);
          //   if (!isMuted) {
          //     new Audio("/notification.mp3").play().catch(() => {});
          //   }
          //   toast({
          //     title: "Time's up!",
          //     description: "Great work! Take a break.",
          //     duration: 5000,
          //   });
          //   return 0;
          // }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, duration]);

  return (
    <timeContext.Provider
      value={{
        timeLeft,
        setTimeLeft,
        isRunning,
        setIsRunning,
        duration,
        setDuration,
      }}
    >
      {children}
    </timeContext.Provider>
  );
};
