import { NextResponse } from "next/server";
import { generateFlashcards } from "@/app/utils/flashcards/flashcard";

interface GenerateFlashcardsBody {
  transcript: string;
  instructions: string;
  language: string;
  cardQuantity: number;
}

export async function POST(req: Request) {
  try {
    const body: GenerateFlashcardsBody = await req.json();
    const flashcards = await generateFlashcards(body);
    return NextResponse.json({ flashcards }, { status: 200 });
  } catch (err) {
    console.error("[Flashcard Generation Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
