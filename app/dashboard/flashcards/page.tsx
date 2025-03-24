import Flashcard from "@/app/components/dashboard/Flashcards";

export const metadata = {
    title: "Flashcards - Dashboard - StorySnatcher",
    description: "View and manage your saved flashcards.",
  };
  
  export default function FlashcardsPage() {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Flashcards</h2>
        <Flashcard />
      </div>
    );
  }
  