"use client";
import React, { useEffect } from "react";
import { Button } from "./Button";

interface ProgressBarProps {
  progress: number;
  // onClose is optional; when provided, the progress modal can be dismissed
  onClose?: () => void;
  // Custom messages from the parent
  inProgressMessage?: string;
  completeMessage?: string;
}

export default function ProgressBar({
  progress,
  onClose,
  inProgressMessage,
  completeMessage,
}: ProgressBarProps) {
  // When progress reaches 100, automatically trigger onClose after 2 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (progress === 100 && onClose) {
      timeout = setTimeout(() => {
        onClose();
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [progress, onClose]);

  // Choose the title message based on progress; use parent's custom messages if provided.
  const titleMessage =
    progress < 100
      ? inProgressMessage || "Processing"
      : completeMessage || "Done";

  return (
    // Modal container with similar styling as your standard Modal component
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-gradient-to-tr from-white to-blue-100 via-blue-50 text-gray-900">
        {/* Title message on top; using a lighter font weight */}
        <h2 className="text-xl font-normal text-center text-gray-800 mb-4">
          {titleMessage}
        </h2>
        {/* Progress bar animation */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            // Fast transition when reaching 100%, slow transition otherwise.
            className={`bg-blue-500 h-4 rounded-full transition-all ease-out ${
              progress === 100 ? "duration-300" : "duration-2000"
            }`}
            style={{ width: `${progress}%`, minWidth: "5%" }}
          ></div>
        </div>
        {/* Percentage text centered below the progress bar */}
        <p className="text-center text-lg font-medium text-gray-700 mt-2">
          {progress}%
        </p>
        {/* Optional Close button, only shown when progress is 100 and onClose is provided */}
        {progress === 100 && onClose && (
          <div className="mt-4 flex justify-center">
            <Button variant="default" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
