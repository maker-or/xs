import React, { useState, useEffect } from "react";
// import { Button } from "~/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";



const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(30);
  // const [isMuted, setIsMuted] = useState(false);
  // const [progress, setProgress] = useState(100);
  // const { toast } = useToast();

  const presetDurations = [
    { label: "30", minutes: 30 },
    { label: "60", minutes: 60 },
    { label: "90", minutes: 90 },
  ];

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
    <div className="bg-[#0c0c0c]/60 backdrop-blur-2xl text-[#f7eee3] rounded-3xl p-6 w-1/2 max-h-[500px] flex flex-col shadow-2xl border border-[#f7eee3]/20 relative overflow-hidden">
      {/* Progress bar */}
      {/* <Progress value={progress} className="h-2" /> */}

      {/* Timer display */}
       <div className="space-y-6 text-center bg-[#f7eee316]  rounded-2xl m-2">
        <div className="font-sans text-[10em]  tracking-tight">
          {formatTime(timeLeft)}
        </div>
         </div>

        
        <div className="flex justify-between p-3">

        {/* Duration slider */}
        <div className="flex justify-center bg-[#f7eee316] p-2 gap-2 rounded-lg">
          {presetDurations.map(({ label, minutes }) => (
            // <button></button>

            <button
              key={label}
              // variant={duration === minutes ? "default" : "secondary"}
              // size="sm"
              onClick={() => setPresetDuration(minutes)}
              className="w-12 h-12 text-md bg-[#0c0c0c] text-[#f7eee3]"
            >
              {label}
            </button>
          ))}
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-2 bg-[#f7eee316] p-2 rounded-lg ">
          <button
            
            // size="icon"
            onClick={toggleTimer}
            className="h-12 w-12 transition-transform hover:scale-105 bg-[#0c0c0c]"
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
            className="h-12 w-12 transition-transform hover:scale-105 bg-[#0c0c0c]"
          >
            <RotateCcw className="h-6 w-6" />
          </button>

          
        </div>
        </div>

      </div>

    
  );
};

export default PomodoroTimer;
