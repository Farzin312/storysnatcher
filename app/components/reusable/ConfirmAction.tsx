"use client";
import React from "react";
import { Button } from "./Button";

interface ConfirmActionProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmAction({ message, onConfirm, onCancel }: ConfirmActionProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-gradient-to-tr from-white to-blue-100 via-blue-50 text-gray-900">
        <p className="text-lg font-medium text-center">{message}</p>
        <div className="mt-4 flex justify-center space-x-4">
          <Button onClick={onConfirm}>Yes</Button>
          <Button variant="default" onClick={onCancel}>No</Button>
        </div>
      </div>
    </div>
  );
}
