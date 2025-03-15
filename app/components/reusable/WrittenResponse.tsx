"use client";
import React, { useState } from "react";

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
  en: { show: "Show Answer", hide: "Hide Answer", noQuestions: "No written response questions generated." },
  es: { show: "Mostrar respuesta", hide: "Ocultar respuesta", noQuestions: "No se generaron preguntas de respuesta escrita." },
  fr: { show: "Afficher la réponse", hide: "Cacher la réponse", noQuestions: "Aucune question à réponse écrite générée." },
  de: { show: "Antwort anzeigen", hide: "Antwort verbergen", noQuestions: "Keine Fragen mit schriftlicher Antwort generiert." },
};

const WrittenResponse: React.FC<WrittenResponseProps> = ({ questions, language }) => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const t = translations[language] || translations["en"];

  const toggleReveal = (id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="overflow-x-auto" style={{ maxWidth: "100%", height: "400px" }}>
      {questions.length === 0 && <p className="text-sm">{t.noQuestions}</p>}
      <div className="flex space-x-4">
        {questions.map((q) => (
          <div key={q.id} className="min-w-[300px] border p-4 rounded shadow-md bg-white">
            <p className="font-bold text-lg mb-3">{q.question}</p>
            {q.answer && (
              <div>
                <span
                  className="underline cursor-pointer text-blue-600"
                  onClick={() => toggleReveal(q.id)}
                >
                  {revealed[q.id] ? t.hide : t.show}
                </span>
                {revealed[q.id] && (
                  <div
                    className="mt-2 p-3 border rounded bg-gray-100 overflow-y-auto"
                    style={{ maxHeight: "150px" }}
                  >
                    <p className="text-sm leading-relaxed">{q.answer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WrittenResponse;
