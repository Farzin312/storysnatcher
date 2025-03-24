"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/reusable/Button";
import ConfirmAction from "@/app/components/reusable/ConfirmAction";
import MultipleChoice from "@/app/components/reusable/MultipleChoice";
import WrittenResponse from "@/app/components/reusable/WrittenResponse";
import ArrowBack from "@/app/components/reusable/ArrowBack";
import { QuizSetRecord } from "@/app/utils/quizzes/saved";

interface QuizQuestionsPageProps {
  quizSet: QuizSetRecord;
  userId?: string;
}

export default function QuizQuestionsPage({ quizSet, userId }: QuizQuestionsPageProps) {
  const router = useRouter();
  const [answersRevealed, setAnswersRevealed] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleRevealAnswers = () => {
    // If the quiz hasn't been taken (no score), ask for confirmation.
    if (quizSet.score == null) {
      setShowConfirm(true);
    } else {
      setAnswersRevealed(true);
    }
  };

  const confirmReveal = () => {
    setAnswersRevealed(true);
    setShowConfirm(false);
  };

  const cancelReveal = () => {
    setShowConfirm(false);
  };

  return (
    <div className="p-8 text-gray-800">
      <div className="mb-6">
        <ArrowBack />
      </div>
      <h1 className="text-4xl font-bold mb-6">{quizSet.quiz_set_name} – Questions</h1>
      <div className="mb-6 flex flex-col sm:flex-row sm:space-x-4">
        <Button onClick={handleRevealAnswers}>Reveal Answers</Button>
        <Button
          variant="outline"
          onClick={() => {
            if (userId)
              router.push(
                `/dashboard/quizzes/${encodeURIComponent(quizSet.quiz_set_name)}?userId=${userId}`
              );
          }}
        >
          Take Quiz
        </Button>
      </div>

      {showConfirm && (
        <ConfirmAction
          message="You haven't taken this quiz yet. Are you sure you want to reveal the answers?"
          onConfirm={confirmReveal}
          onCancel={cancelReveal}
        />
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Multiple Choice Questions</h2>
        {quizSet.quizzes.multipleChoice && quizSet.quizzes.multipleChoice.length > 0 ? (
          <MultipleChoice
            questions={quizSet.quizzes.multipleChoice}
            language="en"
            revealAnswers={answersRevealed}
          />
        ) : (
          <p className="text-sm text-gray-600">No multiple choice questions available.</p>
        )}

        <h2 className="text-2xl font-semibold mt-8 mb-4">Written Response Questions</h2>
        {quizSet.quizzes.writtenResponse && quizSet.quizzes.writtenResponse.length > 0 ? (
          <WrittenResponse
            questions={quizSet.quizzes.writtenResponse}
            language="en"
            revealAnswers={answersRevealed}
          />
        ) : (
          <p className="text-sm text-gray-600">No written response questions available.</p>
        )}
      </div>
    </div>
  );
}
