export const metadata = {
    title: "Dashboard - StorySnatcher",
    description:
      "Manage your saved data including Quick Generate, Transcriptions, Summaries, Flashcards, Quizzes, and Settings in your dashboard.",
  };
  
  import { ReactNode } from "react";
  
  export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
      <div className="min-h-screen bg-blue-50 font-sans">  
        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {children}
          </div>
        </main>
      </div>
    );
  }
  