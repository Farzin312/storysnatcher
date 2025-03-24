import Summary from '../../components/dashboard/Summary'

export const metadata = {
    title: "Summaries - Dashboard - StorySnatcher",
    description: "View and manage your saved summaries.",
  };
  
  export default function SummariesPage() {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Summaries</h2>
        <Summary />
      </div>
    );
  }
  