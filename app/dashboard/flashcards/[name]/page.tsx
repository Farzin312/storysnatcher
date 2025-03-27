import SavedFlashcardsClient from "@/app/components/dashboard/SavedFlashcardsClient";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ name: string }>;
  searchParams?: { userId?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;

  return {
    title: name
      ? `StorySnatcher - Flashcards - ${name}`
      : "Flashcard Set",
  };
}

export default async function FlashcardSetPage({ params }: PageProps) {
  const { name } = await params;
  return <SavedFlashcardsClient name={name} />;
}
