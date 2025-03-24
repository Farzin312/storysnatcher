import { NextResponse } from "next/server";
import { getUserQuizSets } from "@/app/utils/quizzes/db";
import { deleteQuizSet, editQuizSet } from "@/app/utils/quizzes/saved";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  try {
    const quizSets = await getUserQuizSets(userId);
    return NextResponse.json({ quizSets }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const {
      id,
      quiz_set_name,
      quizzes,
      score,
      feedback,
      exam_duration,
      exam_time_taken,
    } = await req.json();

    if (!id || !quiz_set_name || !quizzes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await editQuizSet(
      id,
      quiz_set_name,
      quizzes,
      score,
      feedback,
      exam_duration,
      exam_time_taken
    );

    return NextResponse.json({ message: "Quiz set updated successfully" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Quiz set id is required" }, { status: 400 });
    }
    await deleteQuizSet(id);
    return NextResponse.json({ message: "Quiz set deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
