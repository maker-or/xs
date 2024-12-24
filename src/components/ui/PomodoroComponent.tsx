import React, { useState, useEffect, useContext } from "react";
// import { Button } from "~/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { timeContext } from "~/providers/TimerProvider";

const PomodoroTimer = () => {
  const {
    timeLeft,
    setTimeLeft,
    isRunning,
    setIsRunning,
    duration,
    setDuration,
  } = useContext(timeContext);

  // const [isMuted, setIsMuted] = useState(false);
  // const [progress, setProgress] = useState(100);
  // const { toast } = useToast();

  const presetDurations = [
    { label: "30", minutes: 30 },
    { label: "60", minutes: 60 },
    { label: "90", minutes: 90 },
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
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

  return (
    <div className="relative flex max-h-[500px] w-1/2 flex-col overflow-hidden rounded-3xl border border-[#f7eee3]/20 bg-[#0c0c0c]/60 p-6 text-[#f7eee3] shadow-2xl backdrop-blur-2xl">
      {/* Progress bar */}
      {/* <Progress value={progress} className="h-2" /> */}

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
            // <button></button>

            <button
              key={label}
              // variant={duration === minutes ? "default" : "secondary"}
              // size="sm"
              onClick={() => setPresetDuration(minutes)}
              className="text-md h-12 w-12 bg-[#0c0c0c] text-[#f7eee3]"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-2 rounded-lg bg-[#f7eee316] p-2">
          <button
            // size="icon"
            onClick={toggleTimer}
            className="h-12 w-12 bg-[#0c0c0c] transition-transform hover:scale-105"
          >
            {isRunning ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
          <button
            // size="icon"
            onClick={resetTimer}
            className="h-12 w-12 bg-[#0c0c0c] transition-transform hover:scale-105"
          >
            <RotateCcw className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
