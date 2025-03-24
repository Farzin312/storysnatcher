"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import SavedTranscript, { TranscriptRecord } from "../saved/SavedTranscript";
import TranscriptionView from "../reusable/TranscriptionView";
import { Spinner } from "../reusable";
import LoginModal from "../reusable/LoginModal";
import LoginComponent from "../reusable/LoginComponent";

export default function Transcription() {
  const [user, setUser] = useState<User | null>(null);
  const [savedTranscripts, setSavedTranscripts] = useState<TranscriptRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptRecord | null>(null);
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
      fetchSavedTranscripts();
    }
  }, [user]);

  const fetchSavedTranscripts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transcribe/saved?userId=${user?.uid}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSavedTranscripts(data.transcripts || []);
      }
    } catch {
      setError("Failed to fetch saved transcripts.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-gray-800">
        <LoginComponent onLoginClick={() => setShowLoginModal(true)}>
          {/* Optional: any content for logged-out users */}
          <p className="mb-4">Please log in to view your saved transcripts.</p>
        </LoginComponent>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </div>
    );
  }

  return (
    <div className="p-8 text-gray-800">
      <h2 className="text-3xl font-bold mb-6">Saved Transcripts</h2>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : savedTranscripts.length === 0 ? (
        <p>No saved transcripts available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {savedTranscripts.map((record) => (
            <SavedTranscript
              key={record.id}
              record={record}
              onView={(record) => {
                setSelectedTranscript(record);
                setIsViewModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {isViewModalOpen && selectedTranscript && (
        <TranscriptionView
          isOpen={isViewModalOpen}
          transcriptRecord={selectedTranscript}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedTranscript(null);
            fetchSavedTranscripts();
          }}
        />
      )}
    </div>
  );
}
