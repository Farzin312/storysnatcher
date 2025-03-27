import SavedFlashcardsClient from "@/app/components/dashboard/SavedFlashcardsClient";

// Define a plain type for your route props.
interface PageProps {
  params: { name: string };
  searchParams?: { userId?: string };
}

// 1) generateMetadata as an async function:
export const metadata = {
  title: "Flashcards - Dashboard - StorySnatcher",
  description: "View your Flashcards.",
};

// 2) The page component itself:
export default async function FlashcardSetPage(props: PageProps) {
  // Await the params object again before using
  const params = await Promise.resolve(props.params);
  const { name } = params;

  return <SavedFlashcardsClient name={name} />;
}
