import type { Message } from '@ai-sdk/react';
import type React from 'react';
import { useRef, useState } from 'react';

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

  const userMessages = messages.filter((m) => m.role === 'user');

  if (isMobile || userMessages.length === 0) return null;

  const calcPos = (i: number) =>
    userMessages.length < 2 ? 20 : 20 + (i / (userMessages.length - 1)) * 20;

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
      className="-translate-y-1/2 group fixed top-1/2 left-2 z-[9999] m-3 flex h-[320px] w-12 transform items-center justify-end overflow-visible transition-all duration-500 ease-out"
      onMouseEnter={handleMouseEnterContainer}
      onMouseLeave={handleMouseLeaveContainer}
    >
      {isTimelineHovered && (
        <div
          className="absolute top-1/2 left-full z-[10000] ml-4 max-h-[50vh] w-80 overflow-auto rounded-xl bg-[#181818] text-black shadow-lg"
          onMouseEnter={handleMouseEnterContainer}
          onMouseLeave={handleMouseLeaveContainer}
          style={{ transform: 'translateY(-50%)' }}
        >
          {/* <h3 className="mb-2 font-medium text-lg text-gray-900 dark:text-gray-100">All Questions</h3> */}
          <ul className="space-y-2">
            {userMessages.map((msg) => {
              const isActive = msg.id === currentMessageId;
              return (
                <li
                  className={`cursor-pointer rounded p-2 font-medium text-md hover:bg-gray-100 hover:text-[#000000] ${isActive ? ' font-bold dark:text-[#3c5fb0]' : 'text-gray-500 '}`}
                  key={msg.id}
                  onClick={() => handleMessageClick(msg.id)}
                >
                  {msg.content.length > 80
                    ? msg.content.substring(0, 80) + '...'
                    : msg.content}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Circular markers */}
      <div className="relative h-full w-full overflow-visible">
        {userMessages.map((msg, idx) => {
          const isHovered = hoveredIndex === idx;
          const topPosition = `${calcPos(idx)}%`;

          return (
            <div
              className="-translate-y-1/2 absolute right-5 flex h-1 w-8 transform cursor-pointer items-center justify-start"
              key={msg.id}
              onClick={() => handleMessageClick(msg.id)}
              onMouseEnter={() => {
                if (leaveTimeout.current) clearTimeout(leaveTimeout.current);
                setHoveredIndex(idx);
              }}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ top: topPosition }}
            >
              <div
                className={`h-1 w-8 transform rounded-sm transition-all duration-300 ease-out ${
                  isHovered
                    ? 'm-2 h-1 w-8 scale-125 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/30 shadow-lg dark:from-blue-400 dark:to-indigo-400'
                    : 'h-1 w-8 bg-gray-400 group-hover:h-2.5 group-hover:w-2.5 dark:bg-[#373737]'
                }`}
              />

              {/* Preview box - cleaner minimal design */}
              {isHovered && isTimelineHovered && (
                <div
                  className="absolute right-full z-[10000] mr-4 w-64 whitespace-normal break-words rounded-lg border border-gray-100 bg-white/90 p-3 text-gray-800 text-sm shadow-sm transition-all duration-150 dark:border-gray-800 dark:bg-[#1e1e1e]/95 dark:text-gray-200"
                  onMouseEnter={handleMouseEnterContainer}
                  onMouseLeave={handleMouseLeaveContainer}
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                >
                  <div className="line-clamp-3 font-normal font-sans leading-relaxed">
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
