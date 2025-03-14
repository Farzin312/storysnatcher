import { supabase } from "../client"; // Ensure this imports your preconfigured client
import { CardType } from "@/app/components/reusable/Cards";

interface FlashcardSetRecord {
  id: string;
  firebase_uid: string;
  name: string;
  flashcards: CardType[];
  created_at: string;
}

interface SaveFlashcardSetParams {
  userId: string;
  name: string;
  flashcards: CardType[];
}

export async function saveFlashcardSet({ userId, name, flashcards }: SaveFlashcardSetParams): Promise<FlashcardSetRecord[]> {
  const { data, error } = await supabase
    .from("flashcard_sets")
    .insert([
      {
        firebase_uid: userId,
        name: name,
        flashcards: flashcards,
      },
    ])
    .select();

  if (error) {
    console.error("Supabase insert error:", error);
    throw error;
  }
  if (!data) {
    throw new Error("No data returned from supabase insert.");
  }
  return data;
}

export async function getUserFlashcardSets(userId: string): Promise<FlashcardSetRecord[]> {
  const { data, error } = await supabase
    .from("flashcard_sets")
    .select("*")
    .eq("firebase_uid", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching flashcard sets:", error);
    throw error;
  }
  return data ?? [];
}
