import React from "react";

interface ErrorDisplayProps {
  message: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  icon,
  actionText,
  onAction,
}) => (
  <div
    className="mt-2 text-center p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
    data-oid="svm3-i:"
  >
    <div className="flex items-center justify-center gap-2" data-oid="8mk521g">
      {icon || (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-red-500"
          viewBox="0 0 20 20"
          fill="currentColor"
          data-oid=":9ffs2e"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
            data-oid="rpwi_hy"
          />
        </svg>
      )}
      <span
        className="text-base text-red-600 dark:text-red-400 font-medium"
        data-oid="a3:kr.u"
      >
        {message}
      </span>
    </div>
    {actionText && onAction && (
      <div
        className="mt-2 text-sm text-red-600 dark:text-red-400"
        data-oid="aq0nb00"
      >
        <button
          onClick={onAction}
          className="underline hover:text-red-700 dark:hover:text-red-300"
          data-oid="m5.0.r7"
        >
          {actionText}
        </button>
      </div>
    )}
  </div>
);

export default ErrorDisplay;
