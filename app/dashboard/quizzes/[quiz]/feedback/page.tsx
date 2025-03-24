import { getUserQuizSets } from "@/app/utils/quizzes/db";
import { QuizSetRecord } from "@/app/utils/quizzes/saved";
import { Metadata } from "next";
import Link from "next/link";
import FeedbackDisplay from "@/app/components/reusable/FeedbackDisplay";

interface PageProps {
  params: { quiz: string };
  searchParams?: { userId?: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const titleName = decodeURIComponent(resolvedParams.quiz);
  const title = titleName ? `StorySnatcher - Quiz Feedback - ${titleName}` : "Quiz Feedback";
  return { title };
}

export default async function QuizFeedbackPage({ params, searchParams }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const userId = resolvedSearchParams?.userId;

  // Ensure the user is logged in.
  if (!userId) {
    return (
      <div className="p-8 text-gray-800">
        <p>Please log in to view feedback.</p>
        <Link href="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </div>
    );
  }

  let quizSet: QuizSetRecord | null = null;
  try {
    const sets = await getUserQuizSets(userId);
    quizSet = sets.find(set => set.quiz_set_name === resolvedParams.quiz) || null;
  } catch (error) {
    console.error(error);
  }

  if (!quizSet) {
    return (
      <div className="p-8 text-gray-800">
        <p>Quiz set not found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 text-gray-800">
      <h1 className="text-4xl font-bold mb-6">Feedback for {quizSet.quiz_set_name}</h1>
      {quizSet.feedback ? (
        <div className="p-4 border rounded bg-white shadow">
          <FeedbackDisplay feedback={quizSet.feedback} />
        </div>
      ) : (
        <p>No feedback available for this quiz.</p>
      )}
      <div className="mt-4">
        <Link
          href="/dashboard/quizzes"
          className="border rounded px-4 py-2 hover:bg-gray-200"
        >
          Back
        </Link>
      </div>
    </div>
  );
}
