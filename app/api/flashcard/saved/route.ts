import { NextResponse } from "next/server";
import { getUserFlashcardSets } from "@/app/utils/flashcards/db";
import { deleteFlashcardSet, editFlashcardSet } from "@/app/utils/flashcards/saved";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  try {
    const flashcardSets = await getUserFlashcardSets(userId);
    return NextResponse.json({ flashcardSets }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, name, flashcards } = await req.json();
    if (!id || !name || !flashcards) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await editFlashcardSet(id, name, flashcards);
    return NextResponse.json({ message: "Flashcard set updated successfully" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Flashcard set id is required" }, { status: 400 });
    }
    await deleteFlashcardSet(id);
    return NextResponse.json({ message: "Flashcard set deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
