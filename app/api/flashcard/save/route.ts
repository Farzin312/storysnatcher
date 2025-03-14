import { NextResponse } from "next/server";
import { saveFlashcardSet } from "@/app/utils/flashcards/db";
import { CardType } from "@/app/components/reusable/Cards";

interface SaveFlashcardSetBody {
  userId: string;
  name: string;
  flashcards: CardType[];
}

export async function POST(req: Request) {
  try {
    const body: SaveFlashcardSetBody = await req.json();
    const result = await saveFlashcardSet(body);
    return NextResponse.json({ result }, { status: 200 });
  } catch (err) {
    console.error("[Flashcard Save Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
