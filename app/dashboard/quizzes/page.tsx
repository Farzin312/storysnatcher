import Quizzes from "@/app/components/dashboard/Quizzes";

export const metadata = {
  title: "Quizzes - Dashboard - StorySnatcher",
  description: "View and manage your saved quizzes.",
};

export default function QuizzesPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Quizzes</h2>
      <p className="text-gray-600 mb-4">
        Here you can view, edit, and delete your saved quizzes.
      </p>
      <Quizzes />
    </div>
  );
}
