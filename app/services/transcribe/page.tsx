import { Suspense } from "react";
import { Spinner } from "@/app/components/reusable";
import Transcription from "../../components/services/Transcription";

export default function TranscribePage() {
  return (
    <main className="min-h-screen bg-blue-50 text-gray-800 p-8">
      <Suspense fallback={<Spinner />}>
      <header className="text-center">
          <h1 className="text-4xl font-bold mb-4">Transcription & Study Tools</h1>
          <p className="text-lg text-gray-700">
            Use this page to transcribe your media files or YouTube videos. Your transcription will automatically generate a study guide to help you review the key points. Once satisfied, save all your data at once.
          </p>
        </header>
      <Transcription /> 
      </Suspense>
    </main>
   
  );
}
