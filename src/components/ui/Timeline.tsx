import React, { useState, useRef } from "react";
import { Message } from "@ai-sdk/react";

interface TimelineProps {
  messages: Message[];
  onHoverChange: (hovered: boolean) => void;
  isMobile: boolean;
  onMessageClick?: (messageId: string) => void;
  currentMessageId: string | null;
}

const Timeline: React.FC<TimelineProps> = ({
  messages,
  onHoverChange,
  isMobile,
  onMessageClick,
  currentMessageId,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isTimelineHovered, setIsTimelineHovered] = useState(false);
  const leaveTimeout = useRef<NodeJS.Timeout | null>(null);

  const userMessages = messages.filter((m) => m.role === "user");

  if (isMobile || userMessages.length === 0) return null;

  const calcPos = (i: number) =>
    userMessages.length < 2 ? 50 : 10 + (i / (userMessages.length - 1)) * 80;

  const handleMouseEnterContainer = () => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    setIsTimelineHovered(true);
    onHoverChange(true);
  };

  const handleMouseLeaveContainer = () => {
    if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
    leaveTimeout.current = setTimeout(() => {
      setIsTimelineHovered(false);
      onHoverChange(false);
      setHoveredIndex(null);
    }, 200);
  };

  const handleMessageClick = (messageId: string) => {
    if (onMessageClick) {
      onMessageClick(messageId);
    }
  };

  return (
    <div
      className="fixed right-2 top-1/2 transform -translate-y-1/2 z-[9999] h-[320px] w-12 overflow-visible flex items-center justify-start transition-all duration-500 ease-out group"
      onMouseEnter={handleMouseEnterContainer}
      onMouseLeave={handleMouseLeaveContainer}
    >
      {isTimelineHovered && (
        <div
          className="absolute right-full mr-4 top-1/2 w-80 max-h-[50vh] overflow-auto p-4 text-black bg-[#181818] rounded-xl shadow-lg z-[10000]"
          style={{ transform: "translateY(-50%)" }}
          onMouseEnter={handleMouseEnterContainer}
          onMouseLeave={handleMouseLeaveContainer}
        >
          {/* <h3 className="mb-2 font-medium text-lg text-gray-900 dark:text-gray-100">All Questions</h3> */}
          <ul className="space-y-2">
            {userMessages.map((msg) => {
              const isActive = msg.id === currentMessageId;
              return (
                <li
                  key={msg.id}
                  onClick={() => handleMessageClick(msg.id)}
                  className={`cursor-pointer text-md font-medium hover:text-[#000000] hover:bg-gray-100 p-2 rounded ${isActive ? " dark:text-[#3c5fb0] font-bold" : "text-gray-500 "}`}
                >
                  {msg.content.length > 80
                    ? msg.content.substring(0, 80) + "..."
                    : msg.content}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Circular markers */}
      <div className="relative w-full h-full overflow-visible">
        {userMessages.map((msg, idx) => {
          const isHovered = hoveredIndex === idx;
          const topPosition = `${calcPos(idx)}%`;

          return (
            <div
              key={msg.id}
              className="absolute right-5 transform -translate-y-1/2 cursor-pointer flex items-center justify-center w-8 h-1"
              style={{ top: topPosition }}
              onMouseEnter={() => {
                if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
                setHoveredIndex(idx);
              }}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleMessageClick(msg.id)}
            >
              <div
                className={`rounded-sm w-8 h-1 transition-all duration-300 ease-out transform
                           ${
                             isHovered
                               ? "w-8 h-1 bg-gradient-to-r from-blue-500 m-2 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 scale-125 shadow-lg shadow-blue-500/30"
                               : "w-8 h-1 bg-gray-400 dark:bg-[#373737] group-hover:w-2.5 group-hover:h-2.5"
                           }`}
              />

              {/* Preview box - cleaner minimal design */}
              {isHovered && isTimelineHovered && (
                <div
                  className="absolute right-full mr-4 w-64 p-3 bg-white/90 dark:bg-[#1e1e1e]/95 
                             rounded-lg shadow-sm border border-gray-100 dark:border-gray-800
                             text-sm text-gray-800 dark:text-gray-200 whitespace-normal break-words 
                             transition-all duration-150 z-[10000]"
                  style={{ top: "50%", transform: "translateY(-50%)" }}
                  onMouseEnter={handleMouseEnterContainer}
                  onMouseLeave={handleMouseLeaveContainer}
                >
                  <div className="font-sans font-normal leading-relaxed line-clamp-3">
                    {msg.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
