import QuizTake from "@/app/components/dashboard/QuizTake";
import { getUserQuizSets } from "@/app/utils/quizzes/db";
import { Metadata } from "next";
import { QuizSetRecord } from "@/app/utils/quizzes/saved";

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
      ? `StorySnatcher - Quiz - ${titleName}`
      : "Quiz Set",
  };
}

export default async function QuizSetPage({
  params,
  searchParams,
}: {
  params: Promise<{ quiz: string }>;
  searchParams?: Promise<{ userId?: string }>;
}) {
  const { quiz } = await params;
  const { userId } = searchParams ? await searchParams : {};

  if (!userId) return <p>Quiz set not found.</p>;

  let quizSet: QuizSetRecord | null = null;
  try {
    const sets = await getUserQuizSets(userId);
    quizSet = sets.find((set) => set.quiz_set_name === quiz) || null;
  } catch (error) {
    console.error(error);
  }

  if (!quizSet) return <p>Quiz set not found.</p>;
  return <QuizTake quizSet={quizSet} />;
}
