import SavedFlashcardsClient from "@/app/components/dashboard/SavedFlashcardsClient";
import { Metadata } from "next";

interface PageProps {
  params: { name: string };
  searchParams?: { userId?: string };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  // Await the params object (no-op, but satisfies Next’s requirement)
  const params = await Promise.resolve(props.params);
  const { name } = params;

  const title = name
    ? `StorySnatcher - Flashcards - ${name}`
    : "Flashcard Set";

  return { title };
}

export default async function FlashcardSetPage(props: PageProps) {
  // Await the params object again before using
  const params = await Promise.resolve(props.params);
  const { name } = params;

  return <SavedFlashcardsClient name={name} />;
}
