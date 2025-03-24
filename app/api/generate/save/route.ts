import { NextResponse } from "next/server";
import { saveGeneration, GenerationRecord } from "@/app/utils/generate/db";
import type { Flashcard, QuizMCQuestion, QuizSAQuestion } from "@/app/generate/GenerateClient";

interface SaveGenerationPayload {
  userId: string;
  name: string; // This will be automatically set to the file name or YouTube URL
  transcript: string;
  summary?: string;
  flashcards?: Flashcard[];
  quizMC?: QuizMCQuestion[];
  quizSA?: QuizSAQuestion[];
}

export async function POST(req: Request) {
  try {
    const payload: SaveGenerationPayload = await req.json();
    if (!payload.userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    const recordToSave = {
      user_id: payload.userId,
      name: payload.name,
      transcript: payload.transcript,
      summary: payload.summary || undefined,
      flashcards: payload.flashcards || undefined,
      quiz_mc: payload.quizMC || undefined,
      quiz_sa: payload.quizSA || undefined,
    };
    const savedRecord: GenerationRecord[] = await saveGeneration(recordToSave);
    return NextResponse.json(savedRecord, { status: 200 });
  } catch (error: unknown) {
    console.error("[Save Generation Error]", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}
