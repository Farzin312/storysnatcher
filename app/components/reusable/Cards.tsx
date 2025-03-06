"use client";
import React, { useState } from "react";

export interface CardType {
  id: string;
  question: string;
  answer: string;
  isFlipped: boolean;
  isLocked: boolean;
}

interface CardProps {
  card: CardType;
  onToggle: () => void;
}

const Card: React.FC<CardProps> = ({ card, onToggle }) => {
  const [flipped, setFlipped] = useState(card.isFlipped);

  const handleClick = () => {
    setFlipped(!flipped);
    onToggle();
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-full h-44 sm:h-48 cursor-pointer"
      style={{ perspective: "1000px" }}
    >
      <div
        className="absolute w-full h-full rounded shadow-md transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Side */}
        <div
          className="absolute w-full h-full bg-white rounded p-3 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden" }}
        >
          <p className="text-sm font-semibold text-gray-800">{card.question}</p>
          <div className="text-xs text-gray-600">
            {card.isLocked ? "Locked" : "Tap to lock"}
          </div>
        </div>
        {/* Back Side */}
        <div
          className="absolute w-full h-full bg-white rounded p-3 flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-sm text-gray-800">{card.answer}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
