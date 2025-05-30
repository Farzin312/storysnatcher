"use client";

import React, { useState, Suspense } from "react";
import {
  Spinner,
  GeneratingOverlay,
  Card,
  MultipleChoice,
  WrittenResponse,
  Modal,
  LoginModal
} from "../components/reusable";
import whisperLanguagesData from "../data/whisperLanguages.json";
import { useAuthAndTier } from "@/app/hooks/useAuthAndTier";

// Data structure interfaces
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  isFlipped: boolean;
  isLocked: boolean;
}

export interface QuizMCQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizSAQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface GeneratePayload {
  transcriptionMethod?: "youtube";
  youtubeUrl?: string;
  language: string;
  flashcardPrompt: string;
  flashcardQuantity: number;
  quizPrompt: string;
  mcCount: number;
  saCount: number;
  wantsSummary: boolean;
  summaryType: "concise" | "detailed" | "bullet" | "custom";
  customSummaryPrompt: string;
  autoDownload: boolean;
}

export interface GenerateResponse {
  transcript: string;
  summary?: string;
  flashcards?: Flashcard[];
  quizMC?: QuizMCQuestion[];
  quizSA?: QuizSAQuestion[];
  error?: string;
}

const GenerateClient: React.FC = () => {
  // Form state
  const [language, setLanguage] = useState<string>("en");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [flashcardPrompt, setFlashcardPrompt] = useState<string>(
    "Focus on key points and definitions..."
  );
  const [flashcardQuantity, setFlashcardQuantity] = useState<number>(10);
  const [quizPrompt, setQuizPrompt] = useState<string>("Generate quiz questions...");
  const [mcCount, setMcCount] = useState<number>(5);
  const [saCount, setSaCount] = useState<number>(5);
  const [wantsSummary, setWantsSummary] = useState<boolean>(false);
  const [summaryType, setSummaryType] = useState<"concise" | "detailed" | "bullet" | "custom">("concise");
  const [customSummaryPrompt, setCustomSummaryPrompt] = useState<string>("");
  const [autoDownload, setAutoDownload] = useState<boolean>(false);

  // Result state
  const [transcript, setTranscript] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizMC, setQuizMC] = useState<QuizMCQuestion[]>([]);
  const [quizSA, setQuizSA] = useState<QuizSAQuestion[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Modal state for displaying messages (errors or notifications)
  const [modalMessage, setModalMessage] = useState<string>("");

  // Use the revised hook for auth and usage tracking.
  const { user, tier, checkUsageLimit, updateUsage } = useAuthAndTier();
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Computed name for saving generation: derive from YouTube URL.
  const autoName = youtubeUrl.trim();

  // MAIN SUBMIT – Generation Logic with Validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!flashcardPrompt.trim() || !quizPrompt.trim()) {
      setError("Please fill out all required text fields.");
      return;
    }
    if (youtubeUrl.trim() === "") {
      setError("Please provide a valid YouTube URL.");
      return;
    }
    // Ensure user is logged in.
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    // Check generation usage limit.
    const generationCheck = checkUsageLimit("generation_usage", 1);
    if (!generationCheck.allowed) {
      setModalMessage(
        tier !== "Diamond"
          ? "You have reached your monthly generation limit. Consider upgrading your membership."
          : "You have reached your monthly generation limit. Diamond membership cannot be upgraded."
      );
      return;
    }

    setLoading(true);
    try {
      const generatePayload: GeneratePayload = {
        transcriptionMethod: "youtube",
        youtubeUrl,
        language,
        flashcardPrompt,
        flashcardQuantity,
        quizPrompt,
        mcCount,
        saCount,
        wantsSummary,
        summaryType,
        customSummaryPrompt,
        autoDownload,
      };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatePayload),
      });
      const data: GenerateResponse = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }
      setTranscript(data.transcript || "");
      setSummary(data.summary || "");
      setFlashcards(data.flashcards || []);
      setQuizMC(data.quizMC || []);
      setQuizSA(data.quizSA || []);

      if (autoDownload && data.transcript) {
        const blob = new Blob([data.transcript], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transcript.txt";
        a.click();
        URL.revokeObjectURL(url);
      }

      // Update generation usage count.
      await updateUsage("generation_usage", 1);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Save Generation – only allowed for logged-in users and when data exists.
  const handleSaveGeneration = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    // Check saved generation usage limit.
    const savedCheck = checkUsageLimit("saved_generation", 1);
    if (!savedCheck.allowed) {
      setModalMessage(
        tier !== "Diamond"
          ? "You have reached your saved generations limit. Consider upgrading your membership."
          : "You have reached your saved generations limit. Diamond membership cannot be upgraded."
      );
      return;
    }
    try {
      const payload = {
        userId: user.uid,
        name: autoName, // Auto-derived from YouTube URL.
        transcript,
        summary,
        flashcards,
        quizMC,
        quizSA,
      };
      const res = await fetch("/api/generate/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("Failed to save generation.");
      }
      setModalMessage("Generation saved successfully!");
      await updateUsage("saved_generation", 1);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setModalMessage(err.message);
      } else {
        setModalMessage("An error occurred while saving.");
      }
    }
  };

  return (
    <div className="relative">
      {loading && (
        <GeneratingOverlay text="Please wait, generating request..." />
      )}
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row mx-10">
        {/* Left Side – Form Inputs */}
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-3xl font-bold mb-4">Generate Content</h2>
          {/* Language */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Select Language:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 border rounded w-full"
            >
              {whisperLanguagesData.languages.map((lang: { value: string; label: string }) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Note: YouTube transcripts default to English.
            </p>
          </div>

          {/* YouTube URL */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">YouTube URL:</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full p-2 border rounded"
            />
          </div>

          <hr className="my-4" />

          {/* Summary Options */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Summary:</label>
            <div className="flex items-center space-x-4">
              <label>
                <input
                  type="radio"
                  name="wantsSummary"
                  value="yes"
                  checked={wantsSummary === true}
                  onChange={() => setWantsSummary(true)}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="wantsSummary"
                  value="no"
                  checked={wantsSummary === false}
                  onChange={() => setWantsSummary(false)}
                />{" "}
                No
              </label>
            </div>
            {wantsSummary && (
              <div className="mt-2">
                <label className="block font-semibold mb-1">Summary Type:</label>
                <select
                  value={summaryType}
                  onChange={(e) =>
                    setSummaryType(e.target.value as "concise" | "detailed" | "bullet" | "custom")
                  }
                  className="p-2 border rounded w-full"
                >
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                  <option value="bullet">Bullet Points</option>
                  <option value="custom">Custom</option>
                </select>
                {summaryType === "custom" && (
                  <textarea
                    value={customSummaryPrompt}
                    onChange={(e) => setCustomSummaryPrompt(e.target.value)}
                    placeholder="Enter custom summary instructions..."
                    className="w-full p-2 border rounded mt-2"
                  />
                )}
              </div>
            )}
          </div>

          <hr className="my-4" />

          {/* Flashcards */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Flashcards:</label>
            <textarea
              value={flashcardPrompt}
              onChange={(e) => setFlashcardPrompt(e.target.value)}
              placeholder="Flashcard instructions (e.g., Focus on key points and definitions...)"
              className="w-full p-2 border rounded mb-2"
            />
            <label className="block font-semibold mb-1">Total Flashcards (max 25):</label>
            <input
              type="number"
              min={1}
              max={25}
              value={flashcardQuantity}
              onChange={(e) => setFlashcardQuantity(Number(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>

          <hr className="my-4" />

          {/* Quiz Generator */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Quiz Generator:</label>
            <textarea
              value={quizPrompt}
              onChange={(e) => setQuizPrompt(e.target.value)}
              placeholder="Quiz instructions (e.g., Generate quiz questions...)"
              className="w-full p-2 border rounded mb-2"
            />
            <div className="flex space-x-4 mb-2">
              <div>
                <label className="block font-semibold mb-1">Multiple Choice (max 25):</label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={mcCount}
                  onChange={(e) => setMcCount(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Short Answer (max 25):</label>
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={saCount}
                  onChange={(e) => setSaCount(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          <hr className="my-4" />

          {/* Auto-Download */}
          <div className="mb-4">
            <label className="block font-semibold mb-1">Auto-Download Transcript:</label>
            <div className="flex items-center space-x-4">
              <label>
                <input
                  type="radio"
                  name="autoDownload"
                  value="yes"
                  checked={autoDownload === true}
                  onChange={() => setAutoDownload(true)}
                />{" "}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="autoDownload"
                  value="no"
                  checked={autoDownload === false}
                  onChange={() => setAutoDownload(false)}
                />{" "}
                No
              </label>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded"
            >
              {loading ? "Generating..." : "Generate All"}
            </button>
          </div>
        </div>

        {/* Right Side – Display Results */}
        <div className="w-full md:w-1/2 p-4 border-l">
          {/* Transcript */}
          <div className="mb-4">
            <h3 className="font-semibold">Transcript:</h3>
            <div className="max-h-96 overflow-y-auto bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">
              {transcript || "No Transcript Generated"}
            </div>
          </div>

          {/* Summary */}
          <div className="mb-4">
            <h3 className="font-semibold">Summary:</h3>
            {summary ? (
              <div className="bg-gray-100 p-2 rounded text-sm whitespace-pre-wrap">{summary}</div>
            ) : (
              <p className="text-sm italic text-gray-600">No summary generated.</p>
            )}
          </div>

          {/* Flashcards */}
          <div className="mb-4">
            <h3 className="font-semibold">Flashcards:</h3>
            {flashcards.length > 0 ? (
              <div className="flex space-x-4 overflow-x-auto" style={{ height: "300px" }}>
                {flashcards.map((card) => (
                  <div key={card.id} className="min-w-[250px]">
                    <Card card={card} onToggle={() => {}} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-gray-600">No flashcards generated.</p>
            )}
          </div>

          {/* Quiz Questions */}
          <div className="mb-4">
            <h3 className="font-semibold">Quiz Questions:</h3>
            {(quizMC.length > 0 || quizSA.length > 0) ? (
              <div className="space-y-6">
                {quizMC.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Multiple Choice</h4>
                    <div className="overflow-x-auto" style={{ height: "300px" }}>
                      <Suspense fallback={<Spinner />}>
                        <MultipleChoice questions={quizMC} language={language} />
                      </Suspense>
                    </div>
                  </div>
                )}
                {quizSA.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Written Response</h4>
                    <div className="overflow-x-auto" style={{ height: "300px" }}>
                      <Suspense fallback={<Spinner />}>
                        <WrittenResponse questions={quizSA} language={language} />
                      </Suspense>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm italic text-gray-600">No quiz questions generated.</p>
            )}
          </div>

          {/* Save Generation Button – only show if data exists */}
          {(transcript || summary || flashcards.length > 0 || quizMC.length > 0 || quizSA.length > 0) && (
            <div className="mt-6">
              <button
                type="button"
                onClick={handleSaveGeneration}
                className="w-full px-6 py-3 bg-green-600 text-white rounded"
              >
                Save Generation
              </button>
            </div>
          )}
        </div>
      </form>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage("")} />}
    </div>
  );
};

export default GenerateClient;
