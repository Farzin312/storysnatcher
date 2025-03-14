"use client";
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { LoginModal, Modal, Button, ProgressBar, Spinner } from "../reusable/";
import Card, { CardType } from "../reusable/Cards";
import whisperLanguagesData from "@/app/data/whisperLanguages.json";

interface Transcript {
  id: string;
  transcript_name: string;
  transcript: string;
}

interface WhisperLanguage {
  label: string;
  value: string;
}

const whisperLanguages: WhisperLanguage[] = whisperLanguagesData.languages;
const INITIAL_CARD_QUANTITY = 25;

export default function Flashcards() {
  // Language and method states
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [activeMethod, setActiveMethod] = useState<"saved" | "youtube">("saved");

  // For saved transcripts
  const [savedTranscripts, setSavedTranscripts] = useState<Transcript[]>([]);
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string>("");
  const [transcriptsLoading, setTranscriptsLoading] = useState<boolean>(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");

  // For YouTube method
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");

  // Flashcard generation states
  const [flashcards, setFlashcards] = useState<CardType[]>([]);
  const [flashcardsLoading, setFlashcardsLoading] = useState<boolean>(false);
  const defaultInstructions = "Generate flashcards that ask about key points from the transcript.";

  // New state for naming & saving flashcard set
  const [flashcardSetName, setFlashcardSetName] = useState<string>("");
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  // User auth and error modal
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");

  // Progress modal state and progress percentage
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Persist language selection between remounts
  useEffect(() => {
    const storedLang = localStorage.getItem("selectedLanguage");
    if (storedLang) setSelectedLanguage(storedLang);
  }, []);
  useEffect(() => {
    localStorage.setItem("selectedLanguage", selectedLanguage);
  }, [selectedLanguage]);

  // Listen for auth changes and, if using saved transcripts, fetch them.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && activeMethod === "saved") {
        fetchSavedTranscripts(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [activeMethod]);

  async function fetchSavedTranscripts(userId: string): Promise<void> {
    setTranscriptsLoading(true);
    try {
      const res = await fetch(`/api/transcribe/saved?userId=${userId}`);
      const data: { transcripts: Transcript[] } = await res.json();
      setSavedTranscripts(data.transcripts || []);
      if (data.transcripts && data.transcripts.length > 0) {
        setSelectedTranscriptId(data.transcripts[0].id);
        setCurrentTranscript(data.transcripts[0].transcript);
      }
    } catch (error) {
      console.error("Error fetching saved transcripts:", error);
      setModalMessage("Error fetching saved transcripts. Please try again.");
    } finally {
      setTranscriptsLoading(false);
    }
  }

  // Simulate progress updates for flashcard generation and saving.
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;
    if (flashcardsLoading || saveLoading) {
      setShowProgressModal(true);
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 1 : prev));
      }, 350);
    } else {
      setProgress(100);
      if (!modalMessage) {
        timeout = setTimeout(() => {
          setShowProgressModal(false);
          setProgress(0);
        }, 2000);
      } else {
        setShowProgressModal(false);
        setProgress(0);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [flashcardsLoading, saveLoading, modalMessage]);

  // Generate flashcards by calling our API route.
  async function handleGenerateFlashcards() {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    let transcriptText = "";
    if (activeMethod === "saved") {
      if (!currentTranscript) {
        setModalMessage("No transcript found. Please select a saved transcript.");
        return;
      }
      transcriptText = currentTranscript;
    } else if (activeMethod === "youtube") {
      if (!youtubeUrl) {
        setModalMessage("Please enter a YouTube URL.");
        return;
      }
      try {
        const res = await fetch("/api/transcript-only", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ youtubeUrl }),
        });
        const data = await res.json();
        if (data.error) {
          setModalMessage("Error retrieving transcript: " + data.error);
          return;
        }
        transcriptText = data.transcript;
      } catch (error) {
        console.error("Transcript error:", error);
        setModalMessage("Error retrieving transcript.");
        return;
      }
    }
    const lockedCount = flashcards.filter((c) => c.isLocked).length;
    const cardQuantity = INITIAL_CARD_QUANTITY - lockedCount;
    if (cardQuantity <= 0) {
      setModalMessage("All flashcards are locked. Unlock some to refresh.");
      return;
    }
    setFlashcardsLoading(true);
    try {
      const res = await fetch("/api/flashcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptText,
          instructions: defaultInstructions,
          language: selectedLanguage,
          cardQuantity,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("Error generating flashcards: " + data.error);
      } else {
        // Map the returned flashcards, ensuring each has a unique id and a boolean isLocked.
        const newCards: CardType[] = data.flashcards.map((card: CardType, index: number) => ({
          ...card,
          id: card.id || `flashcard-${Date.now()}-${index}`,
          isLocked: card.isLocked !== undefined ? card.isLocked : false,
        }));
        // Replace only the unlocked flashcards.
        const lockedCards = flashcards.filter((c) => c.isLocked);
        setFlashcards([...lockedCards, ...newCards]);
      }
    } catch (error) {
      console.error("Flashcard generation error:", error);
      setModalMessage("Error generating flashcards. Please try again.");
    } finally {
      setFlashcardsLoading(false);
    }
  }

  // Refresh flashcards: re-generate flashcards for the unlocked ones.
  function handleRefreshFlashcards() {
    handleGenerateFlashcards();
  }

  // Toggle lock state on a flashcard (via checkbox)
  function toggleLock(cardId: string) {
    setFlashcards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, isLocked: !card.isLocked } : card
      )
    );
  }

  // Save flashcard set by calling our API route.
  async function handleSaveFlashcards() {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!flashcardSetName.trim()) {
      setModalMessage("Please provide a name for your flashcard set.");
      return;
    }
    setSaveLoading(true);
    try {
      const res = await fetch("/api/flashcard/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          name: flashcardSetName.trim(),
          flashcards,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("Error saving flashcards: " + data.error);
      } else {
        setModalMessage("Flashcards saved successfully!");
        setFlashcardSetName("");
      }
    } catch (error) {
      console.error("Save flashcards error:", error);
      setModalMessage("Error saving flashcards. Please try again.");
    } finally {
      setSaveLoading(false);
    }
  }

  if (activeMethod === "saved" && transcriptsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-blue-50 text-gray-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Language selector */}
        <div className="flex justify-center items-center space-x-4">
          <label htmlFor="language-select" className="text-gray-700 font-medium">
            Select Language:
          </label>
          <select
            id="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border p-2 rounded"
          >
            {whisperLanguages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Method selection */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={() => setActiveMethod("saved")}
            variant={activeMethod === "saved" ? "default" : "outline"}
            className="rounded-lg"
          >
            Saved Transcript
          </Button>
          <Button
            onClick={() => setActiveMethod("youtube")}
            variant={activeMethod === "youtube" ? "default" : "outline"}
            className="rounded-lg"
          >
            YouTube URL
          </Button>
        </div>

        {/* Transcript input based on method */}
        {activeMethod === "saved" ? (
          <div className="flex flex-col items-center">
            <label
              htmlFor="transcript-select"
              className="font-medium text-center text-gray-700 mb-2"
            >
              Select a Saved Transcript:
            </label>
            <select
              id="transcript-select"
              value={selectedTranscriptId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedTranscriptId(id);
                const transcript = savedTranscripts.find((t) => t.id === id)?.transcript || "";
                setCurrentTranscript(transcript);
              }}
              className="border p-2 rounded w-full max-w-md"
            >
              {savedTranscripts.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.transcript_name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <label htmlFor="youtube-url" className="font-medium text-gray-700">
              Enter YouTube URL:
            </label>
            <input
              type="url"
              id="youtube-url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="border p-2 rounded w-full max-w-md"
            />
          </div>
        )}

        {/* Generate / Refresh Flashcards */}
        <div className="flex justify-center space-x-4">
          <Button onClick={handleGenerateFlashcards} disabled={flashcardsLoading}>
            {flashcardsLoading ? "Generating Flashcards..." : "Generate Flashcards"}
          </Button>
          {flashcards.length > 0 && (
            <Button onClick={handleRefreshFlashcards} disabled={flashcardsLoading}>
              Refresh Flashcards
            </Button>
          )}
        </div>

        {/* Display flashcards in a responsive grid */}
        {flashcards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {flashcards.map((card) => (
              <div key={card.id} className="relative">
                <Card card={card} onToggle={() => {}} />
                <div className="absolute top-1 right-1">
                  <input
                    type="checkbox"
                    checked={!!card.isLocked}
                    onChange={() => toggleLock(card.id)}
                    className="h-4 w-4"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Save flashcard set */}
        {flashcards.length > 0 && (
          <div className="bg-white p-6 rounded shadow-lg mt-4 flex flex-col items-center space-y-2">
            <input
              type="text"
              value={flashcardSetName}
              onChange={(e) => setFlashcardSetName(e.target.value)}
              placeholder="Name your flashcard set"
              className="border p-2 rounded w-full max-w-md"
            />
            <Button onClick={handleSaveFlashcards} disabled={saveLoading}>
              {saveLoading ? "Saving Flashcards..." : "Save Flashcards"}
            </Button>
          </div>
        )}
      </div>

      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage("")} />}
      {showProgressModal && (
        <ProgressBar
          progress={progress}
          onClose={() => {
            setShowProgressModal(false);
            setProgress(0);
          }}
          inProgressMessage="Processing"
          completeMessage="Operation Complete"
        />
      )}
    </div>
  );
}
