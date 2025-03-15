import React, { Suspense } from "react";
import Quizzes from "../../components/services/Quizzes";
import { Spinner } from "@/app/components/reusable";

export default function Page() {
  return (
    <main className="min-h-screen text-gray-800 p-8">
      <Suspense fallback={<Spinner />}>
        <header className="text-center">
          <h1 className="text-4xl font-bold mb-4">Generate Personalized Quizzes</h1>
          <p className="text-lg text-gray-700">
            Create custom quiz questions using your saved transcripts or a YouTube URL.
          </p>
        </header>
        <Quizzes />
      </Suspense>
    </main>
  );
}
