import { supabase } from "../client";
import { QuizGenerationResult } from "./quiz";

export interface QuizSetRecord {
  id: string;
  firebase_uid: string;
  quiz_set_name: string;
  quizzes: QuizGenerationResult;
  score?: number | null;
  feedback?: string | null;
  created_at: string;
  exam_duration?: number | null;
  exam_time_taken?: number | null;
}

export async function deleteQuizSet(id: string): Promise<QuizSetRecord[]> {
  const { data, error } = await supabase.from("quiz_sets").delete().eq("id", id);
  if (error) {
    throw error;
  }
  return data ?? [];
}

export async function editQuizSet(
  id: string,
  quiz_set_name: string,
  quizzes: QuizGenerationResult,
  score?: number,
  feedback?: string,
  exam_duration?: number,
  exam_time_taken?: number
): Promise<QuizSetRecord[]> {
  const { data, error } = await supabase
    .from("quiz_sets")
    .update({
      quiz_set_name,
      quizzes,
      score: score ?? null,
      feedback: feedback ?? null,
      exam_duration: exam_duration ?? null,
      exam_time_taken: exam_time_taken ?? null,
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
  return data ?? [];
}
