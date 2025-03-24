import GenerateClient from "./GenerateClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Learning Assistant - Generate",
  description:
    "Generate transcripts, summaries, flashcards, and quiz questions with our AI Learning Assistant.",
};

export default function GeneratePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">AI Learning Assistant</h1>
      <GenerateClient />
    </div>
  );
}
