import QuizTake from "@/app/components/dashboard/QuizTake";
import { getUserQuizSets } from "@/app/utils/quizzes/db";
import { Metadata } from "next";
import { QuizSetRecord } from "@/app/utils/quizzes/saved";

interface PageProps {
  params: { quiz: string };
  searchParams?: { userId?: string };
}

// Mark this route as dynamic.
export const dynamic = "force-dynamic";

// Await params in generateMetadata.
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const titleName = decodeURIComponent(resolvedParams.quiz);
  const title = titleName ? `StorySnatcher - Quiz - ${titleName}` : "Quiz Set";
  return { title };
}

export default async function QuizSetPage({ params, searchParams }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const userId = resolvedSearchParams?.userId;
  let quizSet: QuizSetRecord | null = null;

  if (userId) {
    try {
      const sets = await getUserQuizSets(userId);
      quizSet = sets.find((set) => set.quiz_set_name === resolvedParams.quiz) || null;
    } catch (error) {
      console.error(error);
    }
  }

  if (!quizSet) {
    return <p>Quiz set not found.</p>;
  }

  return <QuizTake quizSet={quizSet} />;
}
