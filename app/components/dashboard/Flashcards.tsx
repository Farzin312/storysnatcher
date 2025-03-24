"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import SavedFlashcardSet, { FlashcardSetRecord } from "../saved/SavedFlashcardSet";
import { Spinner } from "../reusable";
import LoginModal from "../reusable/LoginModal";
import LoginComponent from "../reusable/LoginComponent";

export default function Flashcard() {
  const [user, setUser] = useState<User | null>(null);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSetRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFlashcardSets();
    }
  }, [user]);

  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/flashcard/saved?userId=${user?.uid}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setFlashcardSets(data.flashcardSets || []);
      }
    } catch {
      setError("Failed to fetch flashcard sets.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-gray-800">
        <LoginComponent onLoginClick={() => setShowLoginModal(true)}>
          <p className="mb-4">Please log in to view your flashcard sets.</p>
        </LoginComponent>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </div>
    );
  }

  return (
    <div className="p-8 text-gray-800">
      <h2 className="text-3xl font-bold mb-6">Saved Flashcard Sets</h2>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : flashcardSets.length === 0 ? (
        <p>No flashcard sets available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {flashcardSets.map((record) => (
            <SavedFlashcardSet key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
