// import { Button } from "~/components/ui/button";
import { Minimize2, Pause, Play, RotateCcw } from 'lucide-react';
import React, { useContext, useState } from 'react';
import { timeContext } from '~/providers/TimerProvider';

const PomodoroTimer = () => {
  const {
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    duration,
    setDuration,
  } = useContext(timeContext);

  const [isMinimized, setIsMinimized] = useState(false);

  // const [isMuted, setIsMuted] = useState(false);
  // const [progress, setProgress] = useState(100);
  // const { toast } = useToast();

  const presetDurations = [
    { label: '30', minutes: 30 },
    { label: '60', minutes: 60 },
    { label: '90', minutes: 90 },
  ];

  // Keyboard shortcuts
  // useEffect(() => {
  //   const handleKeyPress = (e: {
  //     code: string;
  //     preventDefault: () => void;
  //   }) => {
  //     if (e.code === "Space") {
  //       e.preventDefault();
  //       toggleTimer();
  //     } else if (e.code === "KeyR") {
  //       resetTimer();
  //     }
  //   };

  //   window.addEventListener("keydown", handleKeyPress);
  //   return () => window.removeEventListener("keydown", handleKeyPress);
  // }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    // setProgress(100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // const handleDurationChange = (value: unknown[]) => {
  //   const newDuration = value[0];
  //   setDuration(newDuration);
  //   setTimeLeft(newDuration * 60);
  //   setIsRunning(false);
  //   // setProgress(100);
  // };

  const setPresetDuration = (minutes: number) => {
    setDuration(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
    // setProgress(100);
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  // Mini timer that shows in top right when minimized
  if (isMinimized) {
    return (
      <div
        className="fixed top-4 right-4 z-50 flex cursor-pointer items-center gap-2 rounded-lg border border-[#f7eee3]/20 bg-[#000000]/80 p-2 text-[#f7eee3] shadow-lg backdrop-blur-md"
        onClick={toggleMinimized}
      >
        <div className="font-medium text-xl">{formatTime(timeLeft)}</div>
        {isRunning ? (
          <Pause className="h-4 w-4" strokeWidth={1.5} />
        ) : (
          <Play className="h-4 w-4" strokeWidth={1.5} />
        )}
      </div>
    );
  }

  return (
    <div className="relative flex max-h-[500px] w-1/2 flex-col overflow-hidden rounded-3xl border border-[#f7eee3]/20 bg-[#000000]/60 p-6 text-[#f7eee3] shadow-2xl backdrop-blur-2xl">
      {/* Minimize button */}
      <button
        className="absolute top-4 right-4 rounded-md p-1.5 hover:bg-[#f7eee3]/10"
        onClick={toggleMinimized}
      >
        <Minimize2 className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {/* Timer display */}
      <div className="m-2 space-y-6 rounded-2xl bg-[#f7eee316] text-center">
        <div className="font-sans text-[10em] tracking-tight">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex justify-between p-3">
        {/* Duration slider */}
        <div className="flex justify-center gap-2 rounded-lg bg-[#f7eee316] p-2">
          {presetDurations.map(({ label, minutes }) => (
            <button
              className="h-12 w-12 rounded-md bg-[#f7eee3]/80 text-[#000000] text-md hover:scale-105 hover:bg-[#f7eee3]"
              key={label}
              onClick={() => setPresetDuration(minutes)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-2 rounded-lg bg-[#f7eee316] p-2">
          <button
            className="flex h-12 w-12 items-center justify-center rounded-md bg-[#f7eee3]/80 text-[#000000] transition-transform hover:scale-105 hover:bg-[#f7eee3]"
            onClick={toggleTimer}
          >
            {isRunning ? (
              <Pause className="h-6 w-6" strokeWidth={1} />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-md bg-[#f7eee3]/80 text-[#000000] transition-transform hover:scale-105 hover:bg-[#f7eee3]"
            onClick={resetTimer}
          >
            <RotateCcw className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
