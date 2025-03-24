"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal, Spinner } from "@/app/components/reusable";
import ArrowBack from "@/app/components/reusable/ArrowBack";
import ConfirmAction from "@/app/components/reusable/ConfirmAction";
import { QuizSetRecord } from "@/app/utils/quizzes/saved";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";

interface Evaluation {
  questionId: string;
  questionNumber?: number;
  questionText?: string;
  score: number;
  feedback: string;
  // We'll store a label for the question type
  questionType?: string;
}

interface QuizTakeProps {
  quizSet: QuizSetRecord;
}

export default function QuizTake({ quizSet }: QuizTakeProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  const { quizzes } = quizSet;
  const mcQuestions = quizzes.multipleChoice ?? [];
  const saQuestions = quizzes.writtenResponse ?? [];

  // Exam duration.
  const [timeInput, setTimeInput] = useState<number>(quizSet.exam_duration || 5);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examFinished, setExamFinished] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Answers state.
  const [mcAnswers, setMcAnswers] = useState<{ [key: string]: string }>({});
  const [saAnswers, setSaAnswers] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);

  // Start exam and initialize timer.
  const startExam = () => {
    setExamStarted(true);
    setTimeLeft(timeInput * 60);
  };

  // Timer logic.
  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (examStarted && timeLeft === 0 && !examFinished) {
      setModalMessage("Time is up! The exam will now be submitted automatically.");
      initiateSubmit();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [examStarted, timeLeft, examFinished]);

  // MC answer change handler.
  const handleMCAnswer = (questionId: string, selected: string) => {
    setMcAnswers(prev => ({ ...prev, [questionId]: selected }));
  };

  // SA answer change handler.
  const handleSAAnswer = (questionId: string, answer: string) => {
    setSaAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  // Check for blank answers before submission.
  const initiateSubmit = () => {
    const blankMC = mcQuestions.some(q => !mcAnswers[q.id] || mcAnswers[q.id].trim() === "");
    const blankWR = saQuestions.some(q => !saAnswers[q.id] || saAnswers[q.id].trim() === "");
    if (blankMC || blankWR) {
      setShowConfirmSubmit(true);
    } else {
      handleSubmit();
    }
  };

  const confirmSubmit = () => {
    setShowConfirmSubmit(false);
    handleSubmit();
  };

  const cancelSubmit = () => {
    setShowConfirmSubmit(false);
  };

  // Submit the exam, fetch evaluations, and update quiz data.
  const handleSubmit = async () => {
    setSubmitting(true);
    setExamFinished(true);

    // Build MC and written payloads
    const mcPayload = mcQuestions.map(q => ({
      questionId: q.id,
      question: q.question,
      userAnswer: mcAnswers[q.id] && mcAnswers[q.id].trim() !== "" ? mcAnswers[q.id] : "No answer provided",
      correctAnswer: q.correctAnswer,
    }));

    const writtenPayload = saQuestions.map(q => ({
      questionId: q.id,
      question: q.question,
      userAnswer: saAnswers[q.id] && saAnswers[q.id].trim() !== "" ? saAnswers[q.id] : "No answer provided",
      correctAnswer: q.answer || "No correct answer provided",
    }));

    let mcEvaluations: Evaluation[] = [];
    let writtenEvaluations: Evaluation[] = [];

    // Fetch MC evaluations
    try {
      const mcRes = await fetch("/api/quizzes/mc-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quizSet.id, responses: mcPayload }),
      });
      const mcData = await mcRes.json();
      mcEvaluations = Array.isArray(mcData) ? mcData : [mcData];
    } catch (error) {
      console.error("Error in bulk MC evaluation:", error);
    }

    // Fetch written evaluations
    try {
      const writtenRes = await fetch("/api/quizzes/written-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quizSet.id, responses: writtenPayload }),
      });
      const writtenData = await writtenRes.json();
      writtenEvaluations = Array.isArray(writtenData) ? writtenData : [writtenData];
    } catch (error) {
      console.error("Error in bulk written evaluation:", error);
    }

    // Label each evaluation as MC or Written
    const mcWithType = mcEvaluations.map(ev => ({ ...ev, questionType: "Multiple Choice" }));
    const wrWithType = writtenEvaluations.map(ev => ({ ...ev, questionType: "Written Response" }));

    // Combine both MC and written evaluations for feedback
    const allEvaluations = [...mcWithType, ...wrWithType];
    const totalQuestions = allEvaluations.length;
    let totalScore = 0;

    // Build a nicely formatted list of question + feedback
    const detailedFeedbackArray = allEvaluations.map((item, idx) => {
      const qNumber = item.questionNumber || idx + 1;
      const qText = item.questionText || "No question text available";
      const qLabel = item.questionType || "N/A";

      totalScore += item.score;

      // Use Markdown formatting for clarity, plus spacing between items.
      return `**Question ${qNumber}**  
**Type**: ${qLabel}  
**Q**: ${qText}  
**Feedback**: ${item.feedback}`;
    });

    // Calculate average score
    const avgScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;

    // Obtain overall (general) feedback
    let generalFeedback = "";
    try {
      const overallRes = await fetch("/api/quizzes/overall-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quizSet.id,
          feedbacks: allEvaluations.map(item => ({
            questionId: item.questionId,
            feedback: item.feedback,
          })),
        }),
      });
      const overallResult = await overallRes.json();
      generalFeedback = overallResult.generalFeedback;
    } catch (error) {
      console.error("Error obtaining overall feedback:", error);
      generalFeedback = "Could not obtain overall feedback.";
    }

    // Combine everything into a single Markdown string with extra spacing between questions
    const aggregatedFeedback =
      detailedFeedbackArray.join("\n\n") + `\n\n**General Feedback:**\n${generalFeedback}`;

    // Track time taken
    const examTimeTaken = timeInput * 60 - timeLeft;

    // Save or update the quiz set with the aggregated feedback
    try {
      await fetch("/api/quizzes/saved", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: quizSet.id,
          quiz_set_name: quizSet.quiz_set_name,
          quizzes: quizSet.quizzes,
          score: avgScore,
          feedback: aggregatedFeedback.trim(),
          exam_duration: timeInput,
          exam_time_taken: examTimeTaken,
        }),
      });
    } catch (error) {
      console.error("Error updating quiz set with exam info:", error);
    }

    // Navigate to the feedback page
    router.push(`/dashboard/quizzes/${encodeURIComponent(quizSet.quiz_set_name)}/feedback?userId=${user?.uid}`);
    setSubmitting(false);
  };

  // Reset exam state
  const resetExam = () => {
    setExamStarted(false);
    setExamFinished(false);
    setTimeLeft(0);
    setMcAnswers({});
    setSaAnswers({});
    setModalMessage("");
  };

  return (
    <div className="p-8 text-gray-800 relative">
      {/* Loading overlay */}
      {submitting && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-50">
          <Spinner />
        </div>
      )}
      <ArrowBack />

      <h1 className="text-4xl font-bold mb-6">{quizSet.quiz_set_name}</h1>

      {!examStarted ? (
        <div className="mb-6">
          <label className="block mb-2 font-medium">Set exam duration (minutes):</label>
          <input
            type="number"
            value={timeInput}
            onChange={(e) => setTimeInput(Number(e.target.value))}
            className="border p-2 rounded"
          />
          <div className="mt-4">
            <Button onClick={startExam}>
              {quizSet.score != null ? "Retake Quiz" : "Take Quiz"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <p className="font-semibold">Time Left: {timeLeft} seconds</p>
        </div>
      )}

      {examStarted && (
        <>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Multiple Choice Questions</h2>
            {mcQuestions.length === 0 ? (
              <p>No multiple choice questions.</p>
            ) : (
              mcQuestions.map((q, idx) => (
                <div key={q.id} className="mb-4 p-4 border rounded">
                  <p className="mb-2 font-semibold">{idx + 1}. {q.question}</p>
                  <div className="flex flex-col space-y-2">
                    {q.options.map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name={q.id}
                          value={option}
                          checked={mcAnswers[q.id] === option}
                          onChange={() => handleMCAnswer(q.id, option)}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Written Response Questions</h2>
            {saQuestions.length === 0 ? (
              <p>No written response questions.</p>
            ) : (
              saQuestions.map((q, idx) => (
                <div key={q.id} className="mb-4 p-4 border rounded">
                  <p className="mb-2 font-semibold">{mcQuestions.length + idx + 1}. {q.question}</p>
                  <textarea
                    placeholder="Type your answer here..."
                    value={saAnswers[q.id] || ""}
                    onChange={(e) => handleSAAnswer(q.id, e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex space-x-4">
            <Button onClick={initiateSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
            <Button onClick={resetExam} variant="outline">
              Retake Quiz
            </Button>
          </div>
        </>
      )}

      {modalMessage && (
        <Modal onClose={() => setModalMessage("")}>
          <div className="text-center">
            <p>{modalMessage}</p>
          </div>
        </Modal>
      )}

      {showConfirmSubmit && (
        <ConfirmAction
          message="Some answers are blank. Are you sure you want to submit the quiz now?"
          onConfirm={confirmSubmit}
          onCancel={cancelSubmit}
        />
      )}
    </div>
  );
}
