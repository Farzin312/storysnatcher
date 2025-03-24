"use client";
import React, { useState } from "react";
import Card, { CardType } from "@/app/components/reusable/Cards";
import { Button } from "@/app/components/reusable";
import Modal from "@/app/components/reusable/Modal";

interface FlashcardPracticeProps {
  flashcards: CardType[];
  onClose: () => void;
}

export default function FlashcardPractice({ flashcards, onClose }: FlashcardPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState<boolean>(flashcards[0]?.isFlipped || false);

  const handleToggle = () => {
    setFlipped(!flipped);
  };

  const nextCard = () => {
    const newIndex = (currentIndex + 1) % flashcards.length;
    setCurrentIndex(newIndex);
    setFlipped(flashcards[newIndex].isFlipped);
  };

  const prevCard = () => {
    const newIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    setCurrentIndex(newIndex);
    setFlipped(flashcards[newIndex].isFlipped);
  };

  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md">
          <Card card={{ ...flashcards[currentIndex], isFlipped: flipped }} onToggle={handleToggle} />
        </div>
        <div className="mt-4 flex space-x-4">
          <Button onClick={prevCard}>Previous</Button>
          <Button onClick={nextCard}>Next</Button>
        </div>
      </div>
    </Modal>
  );
}
