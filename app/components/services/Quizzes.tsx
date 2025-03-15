"use client";
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { LoginModal, Modal, Button, ProgressBar, Spinner } from "../reusable/";
import MultipleChoice, { QuizMCQuestion } from "../reusable/MultipleChoice";
import WrittenResponse, { QuizSAQuestion } from "../reusable/WrittenResponse";
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
const INITIAL_QUIZ_QUANTITY = 25;

type QuizTypeOption = "mc" | "sa" | "both";

export default function Quizzes() {
  // Language, source, and quiz type states
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [activeMethod, setActiveMethod] = useState<"saved" | "youtube">("saved");
  const [quizType, setQuizType] = useState<QuizTypeOption>("mc");

  // For saved transcripts
  const [savedTranscripts, setSavedTranscripts] = useState<Transcript[]>([]);
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string>("");
  const [transcriptsLoading, setTranscriptsLoading] = useState<boolean>(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");

  // For YouTube method
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");

  // Quiz generation states
  const [mcQuestions, setMcQuestions] = useState<QuizMCQuestion[]>([]);
  const [saQuestions, setSaQuestions] = useState<QuizSAQuestion[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState<boolean>(false);
  const defaultInstructions = "Generate quiz questions based on key points from the transcript.";

  // New state for naming & saving quiz set
  const [quizSetName, setQuizSetName] = useState<string>("");
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

  // Simulate progress updates for quiz generation and saving.
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    let timeout: NodeJS.Timeout | null = null;
    if (quizzesLoading || saveLoading) {
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
  }, [quizzesLoading, saveLoading, modalMessage]);

  // Generate quizzes by calling our API route.
  async function handleGenerateQuizzes() {
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
    setQuizzesLoading(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptText,
          instructions: defaultInstructions,
          language: selectedLanguage,
          quizType,
          cardQuantity: INITIAL_QUIZ_QUANTITY,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("Error generating quizzes: " + data.error);
      } else {
        if (quizType === "mc") {
          setMcQuestions(data.multipleChoice);
          setSaQuestions([]);
        } else if (quizType === "sa") {
          setSaQuestions(data.writtenResponse);
          setMcQuestions([]);
        } else if (quizType === "both") {
          setMcQuestions(data.multipleChoice);
          setSaQuestions(data.writtenResponse);
        }
      }
    } catch (error) {
      console.error("Quiz generation error:", error);
      setModalMessage("Error generating quizzes. Please try again.");
    } finally {
      setQuizzesLoading(false);
    }
  }

  // Save quiz set by calling our API route.
  async function handleSaveQuizzes() {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (!quizSetName.trim()) {
      setModalMessage("Please provide a name for your quiz set.");
      return;
    }
    setSaveLoading(true);
    try {
      const res = await fetch("/api/quizzes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          name: quizSetName.trim(),
          quizzes: { multipleChoice: mcQuestions, writtenResponse: saQuestions },
        }),
      });
      const data = await res.json();
      if (data.error) {
        setModalMessage("Error saving quizzes: " + data.error);
      } else {
        setModalMessage("Quizzes saved successfully!");
        setQuizSetName("");
      }
    } catch (error) {
      console.error("Save quizzes error:", error);
      setModalMessage("Error saving quizzes. Please try again.");
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
    <div className="text-gray-800 p-8">
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

        {/* Quiz Type Selection */}
        <div className="flex justify-center items-center space-x-4">
          <label htmlFor="quiz-type" className="text-gray-700 font-medium">
            Quiz Type:
          </label>
          <select
            id="quiz-type"
            value={quizType}
            onChange={(e) => setQuizType(e.target.value as QuizTypeOption)}
            className="border p-2 rounded"
          >
            <option value="mc">Multiple Choice</option>
            <option value="sa">Written Response</option>
            <option value="both">Both</option>
          </select>
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

        {/* Generate / Refresh Quizzes */}
        <div className="flex justify-center space-x-4">
          <Button onClick={handleGenerateQuizzes} disabled={quizzesLoading}>
            {quizzesLoading ? "Generating Quizzes..." : "Generate Quizzes"}
          </Button>
          {(mcQuestions.length > 0 || saQuestions.length > 0) && (
            <Button onClick={handleGenerateQuizzes} disabled={quizzesLoading}>
              Refresh Quizzes
            </Button>
          )}
        </div>

        {/* Display Multiple Choice Quizzes */}
        {mcQuestions.length > 0 && (
          <div className="mt-8 overflow-x-auto" style={{ maxWidth: "100%", height: "400px" }}>
            <h2 className="text-2xl font-bold mb-4">Multiple Choice Questions</h2>
            <MultipleChoice questions={mcQuestions} language={selectedLanguage} />
          </div>
        )}

        {/* Display Written Response Quizzes */}
        {saQuestions.length > 0 && (
          <div className="mt-8 overflow-x-auto" style={{ maxWidth: "100%"}}>
            <h2 className="text-2xl font-bold mb-4">Written Response Questions</h2>
            <WrittenResponse questions={saQuestions} language={selectedLanguage} />
          </div>
        )}

        {/* Save quiz set */}
        {(mcQuestions.length > 0 || saQuestions.length > 0) && (
          <div className="bg-white p-6 rounded shadow-lg mt-4 flex flex-col items-center space-y-2">
            <input
              type="text"
              value={quizSetName}
              onChange={(e) => setQuizSetName(e.target.value)}
              placeholder="Name your quiz set"
              className="border p-2 rounded w-full max-w-md"
            />
            <Button onClick={handleSaveQuizzes} disabled={saveLoading}>
              {saveLoading ? "Saving Quizzes..." : "Save Quizzes"}
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
