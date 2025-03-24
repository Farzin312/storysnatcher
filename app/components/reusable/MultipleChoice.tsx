"use client";
import React, { useState } from "react";

export interface QuizMCQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface MultipleChoiceProps {
  questions: QuizMCQuestion[];
  language: string;
  revealAnswers?: boolean;
}

const translations: Record<string, { noQuestions: string }> = {
  en: { noQuestions: "No multiple choice questions generated." },
  es: { noQuestions: "No se generaron preguntas de opción múltiple." },
  fr: { noQuestions: "Aucune question à choix multiple générée." },
  de: { noQuestions: "Keine Multiple-Choice-Fragen generiert." },
};

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ questions, language, revealAnswers = false }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number | null>>({});
  const t = translations[language] || translations["en"];

  const handleOptionClick = (questionId: string, optionIdx: number) => {
    if (!revealAnswers) {
      setSelectedOptions((prev) => ({ ...prev, [questionId]: optionIdx }));
    }
  };

  return (
    <div className="overflow-x-auto" style={{ maxWidth: "100%", maxHeight: "500px" }}>
      {questions.length === 0 && <p className="text-sm">{t.noQuestions}</p>}
      {questions.map((q) => (
        <div key={q.id} className="mb-4 p-4 border rounded shadow-sm bg-white">
          <p className="font-semibold text-lg mb-2">{q.question}</p>
          <ul className="space-y-2">
            {q.options.map((option, idx) => {
              const label = String.fromCharCode(65 + idx);
              let bgClass = "bg-gray-50";
              if (revealAnswers) {
                bgClass = option === q.correctAnswer ? "bg-green-200 text-green-800" : "bg-gray-50";
              } else {
                const selectedIdx = selectedOptions[q.id];
                if (selectedIdx !== undefined && selectedIdx !== null) {
                  if (option === q.correctAnswer) {
                    bgClass = "bg-green-200 text-green-800";
                  } else if (selectedIdx === idx && option !== q.correctAnswer) {
                    bgClass = "bg-red-200 text-red-800";
                  }
                }
              }
              return (
                <li key={idx}>
                  <button
                    type="button"
                    disabled={revealAnswers}
                    onClick={() => handleOptionClick(q.id, idx)}
                    className={`w-full text-left p-3 rounded transition-colors duration-200 ${bgClass}`}
                  >
                    <span className="font-semibold mr-2">{label}.</span> {option}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default MultipleChoice;
