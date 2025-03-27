"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import { Spinner, Button, Modal } from "../reusable";
import ConfirmAction from "../reusable/ConfirmAction";
import LoginComponent from "../reusable/LoginComponent";
import LoginModal from "../reusable/LoginModal";
import ArrowBack from "../reusable/ArrowBack";
import Card from "../reusable/Cards";
import MultipleChoice from "../reusable/MultipleChoice";
import WrittenResponse from "../reusable/WrittenResponse";
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

interface GeneratedDataProps {
  data: string; // The generation record name from URL params
}

export default function GeneratedDataClient({ data }: GeneratedDataProps) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [generation, setGeneration] = useState<GenerationRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);

  // Editable fields
  const [editedName, setEditedName] = useState<string>("");
  const [editedTranscript, setEditedTranscript] = useState<string>("");
  const [editedSummary, setEditedSummary] = useState<string>("");
  const [editedFlashcards, setEditedFlashcards] = useState<Flashcard[]>([]);
  const [editedQuizMC, setEditedQuizMC] = useState<QuizMCQuestion[]>([]);
  const [editedQuizSA, setEditedQuizSA] = useState<QuizSAQuestion[]>([]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState<boolean>(false);
  const [revealMC, setRevealMC] = useState<boolean>(false);
  const [revealWR, setRevealWR] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchGeneration();
    }
  }, [user, data]);

  const fetchGeneration = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/generate/saved?userId=${user?.uid}`);
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        // Assuming the API returns an array of GenerationRecord objects.
        const generations: GenerationRecord[] = result || [];
        const decodedData = decodeURIComponent(data);
        console.log("Decoded data param:", decodedData);
        console.log("Fetched generations:", generations);
        const found = generations.find((item) => item.name === decodedData) || null;
        if (found) {
          setGeneration(found);
          setEditedName(found.name);
          setEditedTranscript(found.transcript);
          setEditedSummary(found.summary || "");
          setEditedFlashcards(found.flashcards || []);
          setEditedQuizMC(found.quiz_mc || []);
          setEditedQuizSA(found.quiz_sa || []);
        } else {
          setError("Generated data not found.");
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch generated data.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateGeneration = async () => {
    if (!generation) return;
    try {
      const res = await fetch(`/api/generate/saved`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: generation.id,
          userId: user?.uid,
          name: editedName,
          transcript: editedTranscript,
          summary: editedSummary,
          flashcards: editedFlashcards,
          quiz_mc: editedQuizMC,
          quiz_sa: editedQuizSA,
        }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
        fetchGeneration();
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update generated data.";
      setError(errorMessage);
    }
  };

  const deleteGeneration = async () => {
    if (!generation) return;
    try {
      // Send DELETE with query parameters (userId and id)
      const res = await fetch(
        `/api/generate/saved?userId=${user?.uid}&id=${generation.id}`,
        { method: "DELETE" }
      );
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage("Generation deleted successfully!");
        router.push("/dashboard/generate");

      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete generated data.";
      setError(errorMessage);
    }
  };

  const handleSaveConfirm = async () => {
    await updateGeneration();
    setShowSaveConfirm(false);
    if (!error) {
      setSuccessMessage("Edits saved successfully!");
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessMessage("");
  };

  if (!user) {
    return (
      <div className="p-8 text-gray-800">
        <LoginComponent onLoginClick={() => setShowLoginModal(true)}>
          <p className="mb-4">Please log in to view this generated data.</p>
        </LoginComponent>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </div>
    );
  }

  if (loading) return <Spinner />;
  if (!generation) return <p>No generated data found.</p>;

  return (
    <div className="p-8 text-gray-800">
      <ArrowBack />
      {editing ? (
        <div className="mb-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block font-semibold mb-1">Name:</label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>
          {/* Transcript */}
          <div>
            <label className="block font-semibold mb-1">Transcript:</label>
            <textarea
              value={editedTranscript}
              onChange={(e) => setEditedTranscript(e.target.value)}
              className="border p-2 rounded w-full"
              style={{ height: "400px" }}
            />
          </div>
          {/* Summary */}
          <div>
            <label className="block font-semibold mb-1">Summary:</label>
            <textarea
              value={editedSummary}
              onChange={(e) => setEditedSummary(e.target.value)}
              className="border p-2 rounded w-full"
              style={{ height: "250px" }}
            />
          </div>
          {/* Flashcards */}
          {editedFlashcards && editedFlashcards.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Flashcards</h3>
              {editedFlashcards.map((card, idx) => (
                <div key={card.id} className="mb-2">
                  <label className="block">Flashcard {idx + 1} Question:</label>
                  <input
                    type="text"
                    value={card.question}
                    onChange={(e) => {
                      const updated = [...editedFlashcards];
                      updated[idx] = { ...updated[idx], question: e.target.value };
                      setEditedFlashcards(updated);
                    }}
                    className="border p-2 rounded w-full mb-1"
                  />
                  <label className="block">Flashcard {idx + 1} Answer:</label>
                  <input
                    type="text"
                    value={card.answer}
                    onChange={(e) => {
                      const updated = [...editedFlashcards];
                      updated[idx] = { ...updated[idx], answer: e.target.value };
                      setEditedFlashcards(updated);
                    }}
                    className="border p-2 rounded w-full"
                  />
                </div>
              ))}
            </div>
          )}
          {/* Multiple Choice Questions */}
          {editedQuizMC && editedQuizMC.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Multiple Choice Questions</h3>
              {editedQuizMC.map((q, idx) => (
                <div key={q.id} className="mb-2">
                  <label className="block">Question {idx + 1}:</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => {
                      const updated = [...editedQuizMC];
                      updated[idx] = { ...updated[idx], question: e.target.value };
                      setEditedQuizMC(updated);
                    }}
                    className="border p-2 rounded w-full mb-1"
                  />
                  <label className="block">Options (comma separated):</label>
                  <input
                    type="text"
                    value={q.options.join(", ")}
                    onChange={(e) => {
                      const updated = [...editedQuizMC];
                      updated[idx] = { ...updated[idx], options: e.target.value.split(",").map(s => s.trim()) };
                      setEditedQuizMC(updated);
                    }}
                    className="border p-2 rounded w-full mb-1"
                  />
                  <label className="block">Correct Answer:</label>
                  <input
                    type="text"
                    value={q.correctAnswer}
                    onChange={(e) => {
                      const updated = [...editedQuizMC];
                      updated[idx] = { ...updated[idx], correctAnswer: e.target.value };
                      setEditedQuizMC(updated);
                    }}
                    className="border p-2 rounded w-full"
                  />
                </div>
              ))}
            </div>
          )}
          {/* Written Response Questions */}
          {editedQuizSA && editedQuizSA.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Written Response Questions</h3>
              {editedQuizSA.map((q, idx) => (
                <div key={q.id} className="mb-2">
                  <label className="block">Question {idx + 1}:</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => {
                      const updated = [...editedQuizSA];
                      updated[idx] = { ...updated[idx], question: e.target.value };
                      setEditedQuizSA(updated);
                    }}
                    className="border p-2 rounded w-full mb-1"
                  />
                  <label className="block">Answer:</label>
                  <input
                    type="text"
                    value={q.answer || ""}
                    onChange={(e) => {
                      const updated = [...editedQuizSA];
                      updated[idx] = { ...updated[idx], answer: e.target.value };
                      setEditedQuizSA(updated);
                    }}
                    className="border p-2 rounded w-full"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex space-x-2">
            <Button onClick={() => setShowSaveConfirm(true)}>Save</Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <h1 className="text-3xl font-bold">{generation.name}</h1>
          <p className="text-sm text-gray-600">
            {new Date(generation.created_at).toLocaleDateString()}
          </p>
          {/* Transcript Section with Fixed Height and Vertical Scroll */}
          <div className="mt-4">
            <h3 className="font-semibold">Transcript:</h3>
            <div
              className="whitespace-pre-wrap border p-2 rounded bg-gray-50"
              style={{ height: "400px", overflowY: "auto" }}
            >
              {generation.transcript}
            </div>
          </div>
          {/* Summary Section */}
          {generation.summary && (
            <div className="mt-4">
              <h3 className="font-semibold">Summary:</h3>
              <div className="border p-2 rounded bg-gray-50">{generation.summary}</div>
            </div>
          )}
          {/* Flashcards Section */}
          {generation.flashcards && generation.flashcards.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Flashcards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {generation.flashcards.map((card) => (
                  <Card key={card.id} card={card} onToggle={() => {}} />
                ))}
              </div>
            </div>
          )}
          {/* Multiple Choice Section */}
          {generation.quiz_mc && generation.quiz_mc.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Multiple Choice Questions</h3>
              <Button onClick={() => setRevealMC(!revealMC)} className="mb-2">
                {revealMC ? "Hide Answers" : "Reveal Answers"}
              </Button>
              <MultipleChoice questions={generation.quiz_mc} language="en" revealAnswers={revealMC} />
            </div>
          )}
          {/* Written Response Section */}
          {generation.quiz_sa && generation.quiz_sa.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-bold mb-2">Written Response Questions</h3>
              <Button onClick={() => setRevealWR(!revealWR)} className="mb-2">
                {revealWR ? "Hide Answers" : "Reveal Answers"}
              </Button>
              <WrittenResponse questions={generation.quiz_sa} language="en" revealAnswers={revealWR} />
            </div>
          )}
          <div className="mt-4 flex space-x-2">
            <Button onClick={() => setEditing(true)}>Edit</Button>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Modal onClose={() => setError("")}>
          <p>{error}</p>
        </Modal>
      )}

      {showDeleteConfirm && (
        <ConfirmAction
          message="Are you sure you want to delete this generated data?"
          onConfirm={async () => {
            await deleteGeneration();
            setShowDeleteConfirm(false);
            setSuccessMessage("Generation deleted successfully!");
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {showSaveConfirm && (
        <ConfirmAction
          message="Do you want to save your edits?"
          onConfirm={handleSaveConfirm}
          onCancel={() => setShowSaveConfirm(false)}
        />
      )}

      {successMessage && (
        <Modal onClose={handleSuccessModalClose}>
          <p className="text-center font-semibold">{successMessage}</p>
        </Modal>
      )}
    </div>
  );
}
