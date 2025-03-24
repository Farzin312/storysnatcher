import { supabase } from "../client";
import { CardType } from "@/app/components/reusable/Cards";

export interface FlashcardSetRecord {
  id: string;
  firebase_uid: string;
  name: string;
  flashcards: CardType[];
  created_at: string;
}

export async function deleteFlashcardSet(id: string): Promise<FlashcardSetRecord[]> {
  const { data, error } = await supabase
    .from("flashcard_sets")
    .delete()
    .eq("id", id);
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function editFlashcardSet(
  id: string,
  name: string,
  flashcards: CardType[]
): Promise<FlashcardSetRecord[]> {
  const { data, error } = await supabase
    .from("flashcard_sets")
    .update({ name, flashcards })
    .eq("id", id);
  if (error) {
    throw error;
  }
  return data ?? [];
}
