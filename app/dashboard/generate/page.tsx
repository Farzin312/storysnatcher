import GenerateDashboard from "@/app/components/dashboard/Generate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Generations - Dashboard - StorySnatcher",
  description: "View a summary of your saved generation data.",
};

export default function GeneratePage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Saved Generations</h2>
      <GenerateDashboard />
    </div>
  );
}
