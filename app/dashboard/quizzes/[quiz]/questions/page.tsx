import QuizQuestionsPage from "@/app/components/dashboard/QuizQuestionsPage";
import { getUserQuizSets } from "@/app/utils/quizzes/db";
import { QuizSetRecord } from "@/app/utils/quizzes/saved";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ quiz: string }>;
}): Promise<Metadata> {
  const { quiz } = await params;
  const titleName = decodeURIComponent(quiz);
  return {
    title: titleName
      ? `StorySnatcher - Quiz Questions - ${titleName}`
      : "Quiz Questions",
  };
}

export default async function QuestionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ quiz: string }>;
  searchParams?: Promise<{ userId?: string }>;
}) {
  const { quiz } = await params;
  const { userId } = searchParams ? await searchParams : {};

  let quizSet: QuizSetRecord | null = null;
  if (userId) {
    try {
      const sets = await getUserQuizSets(userId);
      quizSet = sets.find((s) => s.quiz_set_name === quiz) ?? null;
    } catch (error) {
      console.error(error);
    }
  }

  if (!quizSet) {
    return <p>Quiz set not found.</p>;
  }

  return <QuizQuestionsPage quizSet={quizSet} userId={userId} />;
}
