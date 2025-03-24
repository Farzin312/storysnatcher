"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { Spinner, Modal } from "../reusable";
import LoginComponent from "../reusable/LoginComponent";
import LoginModal from "../reusable/LoginModal";
import { useRouter } from "next/navigation";
import { Flashcard, QuizMCQuestion, QuizSAQuestion } from "@/app/generate/GenerateClient";

export interface GenerationRecord {
  id: string;
  user_id: string;
  name: string;
  transcript: string;
  summary?: string;
  flashcards?: Flashcard[];
  quiz_mc?: QuizMCQuestion[];
  quiz_sa?: QuizSAQuestion[];
  created_at: string;
  updated_at: string;
}

export default function GenerateDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [savedGenerations, setSavedGenerations] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchSavedGenerations(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchSavedGenerations = async (uid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/generate/saved?userId=${uid}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        // Assuming the API returns an array of GenerationRecord objects.
        setSavedGenerations(data);
      }
    } catch {
      setError("Failed to fetch saved generations.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-gray-800">
        <LoginComponent onLoginClick={() => setShowLoginModal(true)}>
          <p className="mb-4">Please log in to view your saved generations.</p>
        </LoginComponent>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </div>
    );
  }

  return (
    <div className="p-8 text-gray-800">
      {loading ? (
        <Spinner />
      ) : error ? (
        <Modal message={error} onClose={() => setError("")} />
      ) : savedGenerations.length === 0 ? (
        <p>No saved generations available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {savedGenerations.map((record) => (
            <div
              key={record.id}
              className="border rounded p-4 shadow hover:shadow-lg cursor-pointer"
              onClick={() => router.push(`/dashboard/generate/${encodeURIComponent(record.name)}`)}
            >
              <h3 className="font-bold text-lg">{record.name}</h3>
              <p className="text-sm text-gray-600">
                {new Date(record.created_at).toLocaleDateString()}
              </p>
              {record.summary && (
                <p className="mt-2 text-gray-700 line-clamp-3">{record.summary}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
