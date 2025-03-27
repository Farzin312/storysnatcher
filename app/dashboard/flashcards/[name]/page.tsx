import SavedFlashcardsClient from "@/app/components/dashboard/SavedFlashcardsClient";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  return {
    title: name
      ? `StorySnatcher - Flashcards - ${name}`
      : "Flashcard Set",
  };
}

export default async function FlashcardSetPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return <SavedFlashcardsClient name={name} />;
}
