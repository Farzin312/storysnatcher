"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase";
import Card, { CardType } from "@/app/components/reusable/Cards";
import { Spinner, Button, Modal } from "@/app/components/reusable";
import LoginModal from "@/app/components/reusable/LoginModal";
import LoginComponent from "@/app/components/reusable/LoginComponent";
import ArrowBack from "@/app/components/reusable/ArrowBack";
import FlashcardPractice from "@/app/components/practice/FlashcardPractice";

export interface FlashcardSetRecord {
  id: string;
  firebase_uid: string;
  name: string;
  flashcards: CardType[];
  created_at: string;
}

interface SavedFlashcardsClientProps {
  name: string; // the flashcard set name from URL params
}

export default function SavedFlashcardsClient({ name }: SavedFlashcardsClientProps) {
  const [user, setUser] = useState<User | null>(null);
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSetRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showPractice, setShowPractice] = useState<boolean>(false);
  const [editingSet, setEditingSet] = useState<boolean>(false);
  const [editedSetName, setEditedSetName] = useState<string>("");
  // For individual card editing: track index and temporary values.
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null);
  const [editedCardQuestion, setEditedCardQuestion] = useState<string>("");
  const [editedCardAnswer, setEditedCardAnswer] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFlashcardSet();
    }
  }, [user, name]);

  const fetchFlashcardSet = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/flashcard/saved?userId=${user?.uid}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        const sets: FlashcardSetRecord[] = data.flashcardSets || [];
        const found = sets.find((set) => set.name === name) || null;
        if (found) {
          setFlashcardSet(found);
          setEditedSetName(found.name);
        } else {
          setError("Flashcard set not found.");
        }
      }
    } catch {
      setError("Failed to fetch flashcard set.");
    } finally {
      setLoading(false);
    }
  };

  // Update the entire set (set name and flashcards array)
  const updateSet = async (updatedSet: FlashcardSetRecord) => {
    try {
      const res = await fetch(`/api/flashcard/saved`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedSet.id,
          name: updatedSet.name,
          flashcards: updatedSet.flashcards,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        // Refresh data
        fetchFlashcardSet();
      }
    } catch {
      setError("Failed to update flashcard set.");
    }
  };

  // Delete the entire set
  const deleteSet = async () => {
    if (!flashcardSet) return;
    if (!confirm("Are you sure you want to delete the entire flashcard set?")) return;
    try {
      const res = await fetch(`/api/flashcard/saved`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: flashcardSet.id }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        // Redirect or show a message – here we simply clear the set.
        setFlashcardSet(null);
      }
    } catch {
      setError("Failed to delete flashcard set.");
    }
  };

  // Edit individual card within the set
  const updateCard = async (cardIndex: number, updatedCard: CardType) => {
    if (!flashcardSet) return;
    const updatedFlashcards = [...flashcardSet.flashcards];
    updatedFlashcards[cardIndex] = updatedCard;
    const updatedSet = { ...flashcardSet, flashcards: updatedFlashcards };
    await updateSet(updatedSet);
  };

  // Delete individual card from the set
  const deleteCard = async (cardIndex: number) => {
    if (!flashcardSet) return;
    if (!confirm("Are you sure you want to delete this flashcard?")) return;
    const updatedFlashcards = flashcardSet.flashcards.filter((_, index) => index !== cardIndex);
    const updatedSet = { ...flashcardSet, flashcards: updatedFlashcards };
    await updateSet(updatedSet);
  };

  // If user is not logged in, show login UI.
  if (!user) {
    return (
      <div className="p-8 text-gray-800">
        <LoginComponent onLoginClick={() => setShowLoginModal(true)}>
          <p className="mb-4">Please log in to view this flashcard set.</p>
        </LoginComponent>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </div>
    );
  }

  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!flashcardSet) return <p>No flashcard set found.</p>;

  return (
    <div className="p-8 text-gray-800">
      <ArrowBack />
      <div className="flex items-center justify-between mb-6">
        {editingSet ? (
          <>
            <input
              type="text"
              value={editedSetName}
              onChange={(e) => setEditedSetName(e.target.value)}
              className="border p-2 rounded"
            />
            <div>
              <Button
                onClick={async () => {
                  if (flashcardSet) {
                    await updateSet({ ...flashcardSet, name: editedSetName });
                    setEditingSet(false);
                  }
                }}
              >
                Save Set
              </Button>
              <Button onClick={() => {
                setEditingSet(false);
                setEditedSetName(flashcardSet.name);
              }} variant="outline">
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold">{flashcardSet.name}</h1>
            <div>
              <Button onClick={() => setEditingSet(true)}>Edit Set</Button>
              <Button onClick={deleteSet} variant="outline" className="ml-2">
                Delete Set
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {flashcardSet.flashcards.map((card, index) => (
          <div key={card.id} className="relative">
            <Card card={card} onToggle={() => {}} />
            <div className="absolute top-2 right-2 flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Start editing this card
                  setEditingCardIndex(index);
                  setEditedCardQuestion(card.question);
                  setEditedCardAnswer(card.answer);
                }}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteCard(index)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button onClick={() => setShowPractice(true)}>Test Myself</Button>
      </div>

      {showPractice && (
        <FlashcardPractice
          flashcards={flashcardSet.flashcards}
          onClose={() => setShowPractice(false)}
        />
      )}

      {editingCardIndex !== null && (
        <Modal onClose={() => setEditingCardIndex(null)}>
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-bold">Edit Flashcard</h2>
            <input
              type="text"
              value={editedCardQuestion}
              onChange={(e) => setEditedCardQuestion(e.target.value)}
              placeholder="Question"
              className="border p-2 rounded"
            />
            <textarea
              value={editedCardAnswer}
              onChange={(e) => setEditedCardAnswer(e.target.value)}
              placeholder="Answer"
              className="border p-2 rounded"
            />
            <div className="flex justify-end space-x-2">
              <Button
                onClick={async () => {
                  if (flashcardSet && editingCardIndex !== null) {
                    const updatedCard: CardType = {
                      ...flashcardSet.flashcards[editingCardIndex],
                      question: editedCardQuestion,
                      answer: editedCardAnswer,
                    };
                    await updateCard(editingCardIndex, updatedCard);
                    setEditingCardIndex(null);
                  }
                }}
              >
                Save
              </Button>
              <Button onClick={() => setEditingCardIndex(null)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
