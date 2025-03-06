'use client';
import React, { useState } from 'react';

export interface QuizMCQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface MultipleChoiceProps {
  questions: QuizMCQuestion[];
  language: string;
}

const translations: Record<string, { noQuestions: string }> = {
  en: { noQuestions: "No multiple choice questions generated." },
  es: { noQuestions: "No se generaron preguntas de opción múltiple." },
  fr: { noQuestions: "Aucune question à choix multiple générée." },
  de: { noQuestions: "Keine Multiple-Choice-Fragen generiert." },
  // Add more languages as needed.
};

const MultipleChoice: React.FC<MultipleChoiceProps> = ({ questions, language }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number | null>>({});
  const t = translations[language] || translations['en'];

  const handleOptionClick = (questionId: string, optionIdx: number) => {
    setSelectedOptions((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  return (
    <div>
      {questions.length === 0 && <p className="text-sm">{t.noQuestions}</p>}
      {questions.map((q) => (
        <div key={q.id} className="mb-4 p-2 border rounded">
          <p className="font-semibold mb-2">{q.question}</p>
          <ul>
            {q.options.map((option, idx) => {
              const label = String.fromCharCode(65 + idx); // A, B, C, D...
              const selectedIdx = selectedOptions[q.id];
              let bgClass = 'bg-white';
              if (selectedIdx !== undefined && selectedIdx !== null) {
                if (option === q.correctAnswer) {
                  bgClass = 'bg-green-200 text-green-800';
                } else if (selectedIdx === idx && option !== q.correctAnswer) {
                  bgClass = 'bg-red-200 text-red-800';
                }
              }
              return (
                <li key={idx} className="mb-1">
                  <button
                    type="button"
                    onClick={() => handleOptionClick(q.id, idx)}
                    className={`w-full text-left p-2 rounded transition-colors duration-200 ${bgClass}`}
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
