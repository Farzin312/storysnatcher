"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { Spinner, Button, Modal } from "@/app/components/reusable";
import LoginModal from "@/app/components/reusable/LoginModal";
import LoginComponent from "@/app/components/reusable/LoginComponent";
import { QuizSetRecord } from "@/app/utils/quizzes/saved";
import { useRouter } from "next/navigation";

export default function Quizzes() {
  const [user, setUser] = useState<User | null>(null);
  const [quizSets, setQuizSets] = useState<QuizSetRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchQuizSets();
    }
  }, [user]);

  const fetchQuizSets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/saved?userId=${user.uid}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setQuizSets(data.quizSets || []);
      }
    } catch {
      setError("Failed to fetch quiz sets.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-gray-800">
        <LoginComponent onLoginClick={() => {}}>
          <p className="mb-4">Please log in to view your saved quizzes.</p>
        </LoginComponent>
        <LoginModal onClose={() => {}} />
      </div>
    );
  }

  return (
    <div className="p-8 text-gray-800">
      <h2 className="text-3xl font-bold mb-6">Saved Quizzes</h2>
      {loading ? (
        <Spinner />
      ) : error ? (
        <Modal message={error} onClose={() => setError("")} />
      ) : quizSets.length === 0 ? (
        <p>No saved quizzes available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {quizSets.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white shadow rounded p-4 transform hover:scale-105 transition-transform duration-300"
            >
              <h3 className="text-xl font-semibold mb-2">{quiz.quiz_set_name}</h3>
              {quiz.score == null ? (
                <>
                  <p className="text-sm text-gray-600">Practice Exam</p>
                  <div className="mt-4 flex flex-col sm:flex-row sm:space-x-2">
                    <Button
                      onClick={() =>
                        router.push(
                          `/dashboard/quizzes/${encodeURIComponent(
                            quiz.quiz_set_name
                          )}/questions?userId=${user.uid}`
                        )
                      }
                    >
                      View Quiz
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(
                          `/dashboard/quizzes/${encodeURIComponent(
                            quiz.quiz_set_name
                          )}?userId=${user.uid}`
                        )
                      }
                      variant="outline"
                    >
                      Take Quiz
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-600">Score: {quiz.score}</p>
                  {quiz.exam_time_taken != null && (
                    <p className="text-sm text-gray-600">
                      Time Taken: {quiz.exam_time_taken} seconds
                    </p>
                  )}
                  <div className="mt-4 flex flex-col sm:flex-row sm:space-x-2">
                    <Button
                      onClick={() =>
                        router.push(
                          `/dashboard/quizzes/${encodeURIComponent(
                            quiz.quiz_set_name
                          )}/questions?userId=${user.uid}`
                        )
                      }
                    >
                      View Quiz
                    </Button>
                    {quiz.feedback && (
                      <Button
                        onClick={() =>
                          router.push(
                            `/dashboard/quizzes/${encodeURIComponent(
                              quiz.quiz_set_name
                            )}/feedback?userId=${user.uid}`
                          )
                        }
                        variant="outline"
                      >
                        View Feedback
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
