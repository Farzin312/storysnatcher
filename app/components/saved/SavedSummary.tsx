"use client";
import React from "react";
import { Button } from "../reusable";

export interface SummaryRecord {
  id: string;
  firebase_uid: string;
  transcript_id: number | null;
  summary: string;
  summary_name: string;
  created_at: string;
}

interface SavedSummaryProps {
  record: SummaryRecord;
  onView: (record: SummaryRecord) => void;
}

const SavedSummary: React.FC<SavedSummaryProps> = ({ record, onView }) => {
  const getPreview = (text: string) => {
    if (!text) return "";
    const periodIndex = text.indexOf(".");
    return periodIndex !== -1 ? text.substring(0, periodIndex + 1) + "..." : text;
  };

  return (
    <div className="bg-white shadow rounded p-4 flex flex-col transform hover:scale-105 transition-transform duration-300">
      <h3 className="text-xl font-semibold mb-2">{record.summary_name}</h3>
      <p className="text-sm text-gray-600">
        <strong>Summary:</strong> {getPreview(record.summary)}
      </p>
      <div className="mt-auto flex justify-end pt-4">
        <Button onClick={() => onView(record)}>View</Button>
      </div>
    </div>
  );
};

export default SavedSummary;
