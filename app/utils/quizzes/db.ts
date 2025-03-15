import { supabase } from "../client"; 
import { QuizGenerationResult } from "./quiz";

interface QuizSetRecord {
  id: string;
  firebase_uid: string;
  quiz_set_name: string;
  quizzes: QuizGenerationResult;
  created_at: string;
}

interface SaveQuizSetParams {
  userId: string;
  name: string;
  quizzes: QuizGenerationResult;
}

export async function saveQuizSet({ userId, name, quizzes }: SaveQuizSetParams): Promise<QuizSetRecord[]> {
  const { data, error } = await supabase
    .from("quiz_sets")
    .insert([
      {
        firebase_uid: userId,
        quiz_set_name: name,
        quizzes,
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

export async function getUserQuizSets(userId: string): Promise<QuizSetRecord[]> {
  const { data, error } = await supabase
    .from("quiz_sets")
    .select("*")
    .eq("firebase_uid", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching quiz sets:", error);
    throw error;
  }
  return data ?? [];
}
