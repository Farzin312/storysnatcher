"use client";
import { Button } from "./Button";

interface ModalProps {
  message?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function Modal({ message, onClose, children }: ModalProps) {

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-gradient-to-tr from-white to-blue-100 via-blue-50 text-gray-900">
        {/* Render children if provided; otherwise render the message */}
        {children ? (
          children
        ) : (
          <p className="text-lg font-medium text-center">{message}</p>
        )}
        <div className="mt-4 flex justify-center">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
