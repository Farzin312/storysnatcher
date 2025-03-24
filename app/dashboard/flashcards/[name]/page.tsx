import SavedFlashcardsClient from "@/app/components/dashboard/SavedFlashcardsClient";
import { Metadata } from "next";

interface PageProps {
  params: { name: string };
  searchParams: { userId?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Do not use await here since params.name is a string.
  const titleName = params.name;
  const title = titleName ? `StorySnatcher - Flashcards - ${titleName}` : "Flashcard Set";
  return { title };
}

export default function FlashcardSetPage({ params }: PageProps) {
  // Pass only the set name to the client component.
  return <SavedFlashcardsClient name={params.name} />;
}
