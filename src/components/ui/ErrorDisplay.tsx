import type React from 'react';

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
    className="mt-2 rounded-lg border border-red-200 bg-red-100 p-3 text-center dark:border-red-800 dark:bg-red-900/30"
    data-oid="svm3-i:"
  >
    <div className="flex items-center justify-center gap-2" data-oid="8mk521g">
      {icon || (
        <svg
          className="h-5 w-5 text-red-500"
          data-oid=":9ffs2e"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            data-oid="rpwi_hy"
            fillRule="evenodd"
          />
        </svg>
      )}
      <span
        className="font-medium text-base text-red-600 dark:text-red-400"
        data-oid="a3:kr.u"
      >
        {message}
      </span>
    </div>
    {actionText && onAction && (
      <div
        className="mt-2 text-red-600 text-sm dark:text-red-400"
        data-oid="aq0nb00"
      >
        <button
          className="underline hover:text-red-700 dark:hover:text-red-300"
          data-oid="m5.0.r7"
          onClick={onAction}
        >
          {actionText}
        </button>
      </div>
    )}
  </div>
);

export default ErrorDisplay;
