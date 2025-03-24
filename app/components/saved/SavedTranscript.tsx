"use client";
import React from "react";
import { Button } from "../reusable";

export interface TranscriptRecord {
  id: number;
  firebase_uid: string;
  transcript: string;
  study_guide?: string;
  source: string;
  transcript_name: string;
  created_at?: string;
}

interface SavedTranscriptProps {
  record: TranscriptRecord;
  onView: (record: TranscriptRecord) => void;
}

const SavedTranscript: React.FC<SavedTranscriptProps> = ({ record, onView }) => {
  const getPreview = (text: string) => {
    if (!text) return "";
    const periodIndex = text.indexOf(".");
    return periodIndex !== -1 ? text.substring(0, periodIndex + 1) + "..." : text;
  };

  return (
    <div className="bg-white shadow rounded p-4 flex flex-col transform hover:scale-105 transition-transform duration-300">
      <h3 className="text-xl font-semibold mb-2">{record.transcript_name}</h3>
      <p className="text-sm text-gray-600">
        <strong>Transcript:</strong> {getPreview(record.transcript)}
      </p>
      <p className="text-sm text-gray-600 mt-2">
        <strong>Study Guide:</strong> {getPreview(record.study_guide || "")}
      </p>
      <div className="mt-auto flex justify-end pt-4">
        <Button onClick={() => onView(record)}>View</Button>
      </div>
    </div>
  );
};

export default SavedTranscript;
