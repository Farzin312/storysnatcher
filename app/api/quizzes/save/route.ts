import { NextResponse } from "next/server";
import { saveQuizSet } from "@/app/utils/quizzes/db";
import { QuizGenerationResult } from "@/app/utils/quizzes/quiz"; 

interface SaveQuizSetBody {
  userId: string;
  name: string;
  quizzes: QuizGenerationResult;
}

export async function POST(req: Request) {
  try {
    const body: SaveQuizSetBody = await req.json();
    const result = await saveQuizSet(body);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("[Quiz Save Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
