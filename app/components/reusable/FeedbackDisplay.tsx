// app/components/FeedbackDisplay.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

interface FeedbackDisplayProps {
  feedback: string;
}

export default function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{feedback}</ReactMarkdown>
    </div>
  );
}
