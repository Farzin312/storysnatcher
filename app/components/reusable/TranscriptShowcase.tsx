"use client";
import React from "react";

export interface Transcript {
  id: string;
  transcript_name: string;
}

interface TranscriptShowcaseProps {
  transcripts: Transcript[];
  onSelect: (transcriptId: string) => void;
}

export default function TranscriptShowcase({ transcripts, onSelect }: TranscriptShowcaseProps) {
  if (!transcripts || transcripts.length === 0) {
    return <p className="text-center text-gray-500">No saved transcripts available.</p>;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {transcripts.map((t) => (
        <div
          key={t.id}
          className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer transition-shadow"
          onClick={() => onSelect(t.id)}
        >
          <h3 className="text-lg font-semibold">{t.transcript_name}</h3>
          {/* Optionally, add more details or a snippet */}
        </div>
      ))}
    </div>
  );
}
