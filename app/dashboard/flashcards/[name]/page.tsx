import SavedFlashcardsClient from "@/app/components/dashboard/SavedFlashcardsClient";
import { Metadata } from "next";

interface PageProps {
  params: { name: string };
  searchParams: { userId?: string };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  // Make sure to await the params.
  const params = await Promise.resolve(props.params);
  const titleName = params.name;
  const title = titleName
    ? `StorySnatcher - Flashcards - ${titleName}`
    : "Flashcard Set";
  return { title };
}

export default async function FlashcardSetPage(props: PageProps) {
  // Also await the params before using it in the component.
  const params = await Promise.resolve(props.params);
  return <SavedFlashcardsClient name={params.name} />;
}
