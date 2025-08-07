import { ArrowUp } from 'lucide-react';
import type React from 'react';

interface SubmitButtonProps {
  isLoading?: boolean;
  isStreaming?: boolean;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading = false,
  isStreaming = false,
  type = 'submit',
  disabled = false,
  className = '',
  onClick,
}) => {
  return (
    <div className="box-shadow: 76px 2px 58px -95px rgba(224,224,224,1) inset; flex items-center justify-center rounded-full bg-[#455A5E] p-1">
      <button
        className={`box-shadow: 76px 2px 58px -95px rgba(136, 135, 135, 1) inset rounded-full bg-[#0D0C0C] p-3 text-[#f7eee3] drop-shadow-xl-[#888787] transition-colors duration-200 hover:bg-[#323232] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        disabled={disabled}
        onClick={onClick}
        type={type}
      >
        {isLoading || isStreaming ? (
          <div className="relative flex h-5 w-5 items-center justify-center">
            {/* Agentic workflow animation */}
            <svg
              className="animate-spin-slow"
              height="20"
              viewBox="0 0 50 50"
              width="20"
            >
              {/* Base circular path */}
              <circle
                cx="25"
                cy="25"
                fill="none"
                opacity="0.3"
                r="20"
                stroke="#f7eee3"
                strokeWidth="1"
              />

              {/* Nodes representing processing steps */}
              <circle
                className="animate-pulse-node"
                cx="25"
                cy="5"
                fill="#f7eee3"
                r="3"
                style={{ animationDelay: '0ms' }}
              />

              <circle
                className="animate-pulse-node"
                cx="41"
                cy="15"
                fill="#f7eee3"
                r="3"
                style={{ animationDelay: '300ms' }}
              />

              <circle
                className="animate-pulse-node"
                cx="41"
                cy="35"
                fill="#f7eee3"
                r="3"
                style={{ animationDelay: '600ms' }}
              />

              <circle
                className="animate-pulse-node"
                cx="25"
                cy="45"
                fill="#f7eee3"
                r="3"
                style={{ animationDelay: '900ms' }}
              />

              <circle
                className="animate-pulse-node"
                cx="9"
                cy="35"
                fill="#f7eee3"
                r="3"
                style={{ animationDelay: '1200ms' }}
              />

              <circle
                className="animate-pulse-node"
                cx="9"
                cy="15"
                fill="#f7eee3"
                r="3"
                style={{ animationDelay: '1500ms' }}
              />

              {/* Flowing path/connection */}
              <path
                className="animate-dash-flow"
                d="M25,5 L41,15 L41,35 L25,45 L9,35 L9,15 Z"
                fill="none"
                stroke="#f7eee3"
                strokeDasharray="100"
                strokeDashoffset="100"
                strokeWidth="1.5"
              />

              {/* Center node - representing the agent */}
              <circle
                className="animate-pulse-agent"
                cx="25"
                cy="25"
                fill="#48AAFF"
                r="4"
              />
            </svg>

            {/* Small dot in center for focus */}
            <div className="absolute h-1 w-1 animate-ping-slow rounded-full bg-white" />
          </div>
        ) : (
          <ArrowUp className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default SubmitButton;
