import React from "react";
import { ArrowUp } from "lucide-react";

interface SubmitButtonProps {
  isLoading?: boolean;
  isStreaming?: boolean;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading = false,
  isStreaming = false,
  type = "submit",
  disabled = false,
  className = "",
  onClick,
}) => {
  return (
    <div className="flex items-center justify-center p-1 bg-[#455A5E] rounded-full box-shadow: 76px 2px 58px -95px rgba(224,224,224,1) inset;">
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`p-3 rounded-full bg-[#0D0C0C] hover:bg-[#323232] text-[#f7eee3] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-xl-[#888787] box-shadow: 76px 2px 58px -95px rgba(136, 135, 135, 1) inset ${className}`}
      >
        {isLoading || isStreaming ? (
          <div className="relative h-5 w-5 flex items-center justify-center">
            {/* Agentic workflow animation */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 50 50"
              className="animate-spin-slow"
            >
              {/* Base circular path */}
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="#f7eee3"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
              />

              {/* Nodes representing processing steps */}
              <circle
                cx="25"
                cy="5"
                r="3"
                fill="#f7eee3"
                className="animate-pulse-node"
                style={{ animationDelay: "0ms" }}
              />

              <circle
                cx="41"
                cy="15"
                r="3"
                fill="#f7eee3"
                className="animate-pulse-node"
                style={{ animationDelay: "300ms" }}
              />

              <circle
                cx="41"
                cy="35"
                r="3"
                fill="#f7eee3"
                className="animate-pulse-node"
                style={{ animationDelay: "600ms" }}
              />

              <circle
                cx="25"
                cy="45"
                r="3"
                fill="#f7eee3"
                className="animate-pulse-node"
                style={{ animationDelay: "900ms" }}
              />

              <circle
                cx="9"
                cy="35"
                r="3"
                fill="#f7eee3"
                className="animate-pulse-node"
                style={{ animationDelay: "1200ms" }}
              />

              <circle
                cx="9"
                cy="15"
                r="3"
                fill="#f7eee3"
                className="animate-pulse-node"
                style={{ animationDelay: "1500ms" }}
              />

              {/* Flowing path/connection */}
              <path
                d="M25,5 L41,15 L41,35 L25,45 L9,35 L9,15 Z"
                stroke="#f7eee3"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="100"
                strokeDashoffset="100"
                className="animate-dash-flow"
              />

              {/* Center node - representing the agent */}
              <circle
                cx="25"
                cy="25"
                r="4"
                fill="#48AAFF"
                className="animate-pulse-agent"
              />
            </svg>

            {/* Small dot in center for focus */}
            <div className="absolute w-1 h-1 bg-white rounded-full animate-ping-slow"></div>
          </div>
        ) : (
          <ArrowUp className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default SubmitButton;
