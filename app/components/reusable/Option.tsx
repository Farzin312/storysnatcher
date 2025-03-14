"use client";
import React from "react";
import { Button } from "./Button";

interface OptionProps {
  question: string;
  selectOptions: { label: string; value: string }[];
  selectedOption: string;
  onSelectChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function Option({
  question,
  selectOptions,
  selectedOption,
  onSelectChange,
  onSave,
  onClose,
}: OptionProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
      <div className="w-full max-w-md p-6 rounded-lg shadow-lg bg-gradient-to-tr from-white to-blue-100 via-blue-50 text-gray-900">
        <p className="text-lg font-medium text-center">{question}</p>
        <div className="mt-4">
          <select
            value={selectedOption}
            onChange={(e) => onSelectChange(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {selectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex justify-center space-x-4">
          <Button onClick={onSave}>Save</Button>
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
