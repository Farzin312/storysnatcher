"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import SavedSummary, { SummaryRecord } from "../saved/SavedSummary";
import ViewSummary from "../reusable/ViewSummary";
import { Spinner } from "../reusable";
import LoginModal from "../reusable/LoginModal";
import LoginComponent from "../reusable/LoginComponent";

export default function Summary() {
  const [user, setUser] = useState<User | null>(null);
  const [savedSummaries, setSavedSummaries] = useState<SummaryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedSummary, setSelectedSummary] = useState<SummaryRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSavedSummaries();
    }
  }, [user]);

  const fetchSavedSummaries = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/summarize/saved?userId=${user?.uid}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSavedSummaries(data.summaries || []);
      }
    } catch {
      setError("Failed to fetch saved summaries.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-gray-800">
        <LoginComponent onLoginClick={() => setShowLoginModal(true)}>
          <p className="mb-4">Please log in to view your saved summaries.</p>
        </LoginComponent>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </div>
    );
  }

  return (
    <div className="p-8 text-gray-800">
      <h2 className="text-3xl font-bold mb-6">Saved Summaries</h2>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : savedSummaries.length === 0 ? (
        <p>No saved summaries available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {savedSummaries.map((record) => (
            <SavedSummary
              key={record.id}
              record={record}
              onView={(record) => {
                setSelectedSummary(record);
                setIsViewModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {isViewModalOpen && selectedSummary && (
        <ViewSummary
          isOpen={isViewModalOpen}
          summaryRecord={selectedSummary}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedSummary(null);
            fetchSavedSummaries();
          }}
        />
      )}
    </div>
  );
}
