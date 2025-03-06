'use client';
import React, { useState } from 'react';

export interface QuizSAQuestion {
  id: string;
  question: string;
  answer?: string;
}

interface WrittenResponseProps {
  questions: QuizSAQuestion[];
  language: string;
}

const translations: Record<string, { show: string; hide: string; noQuestions: string }> = {
  en: { show: "Show Answer", hide: "Hide Answer", noQuestions: "No short answer questions generated." },
  es: { show: "Mostrar respuesta", hide: "Ocultar respuesta", noQuestions: "No se generaron preguntas de respuesta corta." },
  fr: { show: "Afficher la réponse", hide: "Cacher la réponse", noQuestions: "Aucune question à réponse courte générée." },
  de: { show: "Antwort anzeigen", hide: "Antwort verbergen", noQuestions: "Keine Kurzantwort-Fragen generiert." },
  // Add more languages as needed.
};

const WrittenResponse: React.FC<WrittenResponseProps> = ({ questions, language }) => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const t = translations[language] || translations['en'];

  const toggleReveal = (id: string) => {
    setRevealed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex space-x-4">
      {questions.length === 0 && <p className="text-sm">{t.noQuestions}</p>}
      {questions.map((q) => (
        <div key={q.id} className="min-w-[250px] border p-2 rounded">
          <p className="font-bold mb-2">{q.question}</p>
          {q.answer && (
            <div>
              <span
                className="underline cursor-pointer text-blue-600"
                onClick={() => toggleReveal(q.id)}
              >
                {revealed[q.id] ? t.hide : t.show}
              </span>
              {revealed[q.id] && <p className="mt-2 p-2 border rounded bg-gray-100">{q.answer}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WrittenResponse;
