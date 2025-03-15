import { NextResponse } from "next/server";
import { generateQuizzes } from "@/app/utils/quizzes/quiz";

interface GenerateQuizzesBody {
  transcript: string;
  instructions: string;
  language: string;
  quizType: "mc" | "sa" | "both";
  cardQuantity: number;
}

export async function POST(req: Request) {
  try {
    const body: GenerateQuizzesBody = await req.json();
    const quizzes = await generateQuizzes(body);
    return NextResponse.json(quizzes, { status: 200 });
  } catch (err) {
    console.error("[Quiz Generation Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
