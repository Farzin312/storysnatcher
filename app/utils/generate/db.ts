import { supabase } from "../client";
import type { Flashcard, QuizMCQuestion, QuizSAQuestion } from "@/app/generate/GenerateClient";

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

export async function saveGeneration(
  record: Omit<GenerationRecord, "id" | "created_at" | "updated_at">
): Promise<GenerationRecord[]> {
  const { data, error } = await supabase
    .from("generate_history")
    .insert(record)
    .select();
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("No data returned from supabase insert.");
  }
  return data;
}

export async function getGenerations(userId: string): Promise<GenerationRecord[]> {
  const { data, error } = await supabase
    .from("generate_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function updateGeneration(
  id: string,
  record: Partial<Omit<GenerationRecord, "id" | "created_at" | "updated_at">>,
  userId: string
): Promise<GenerationRecord> {
  const { data, error } = await supabase
    .from("generate_history")
    .update(record)
    .eq("id", id)
    .eq("user_id", userId)
    .select()  // Add this to return the updated row
    .single();
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error("No data returned from supabase update.");
  }
  return data;
}

export async function deleteGeneration(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("generate_history")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    throw error;
  }
}
