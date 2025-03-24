"use client";
import React from "react";
import Card, { CardType } from "../reusable/Cards";
import { Button } from "../reusable";

export interface FlashcardSetRecord {
  id: string;
  firebase_uid: string;
  name: string;
  flashcards: CardType[];
  created_at: string;
}

interface SavedFlashcardSetProps {
  record: FlashcardSetRecord;
}

export default function SavedFlashcardSet({ record }: SavedFlashcardSetProps) {
  const previewCard: CardType | undefined = record.flashcards[0];

  return (
    <div className="bg-white shadow rounded p-4 transform hover:scale-105 transition-transform duration-300">
      <h3 className="text-xl font-semibold mb-2">{record.name}</h3>
      <div className="mb-4">
        {previewCard ? (
          <Card card={previewCard} onToggle={() => {}} />
        ) : (
          <p className="text-sm text-gray-600">No flashcards available</p>
        )}
      </div>
      <div className="mt-4">
        <Button onClick={() => window.location.href = `/dashboard/flashcards/${encodeURIComponent(record.name)}`}>
          View
        </Button>
      </div>
    </div>
  );
}
