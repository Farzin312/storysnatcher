import Transcription from '../../components/dashboard/Transcription'

export const metadata = {
    title: "Transcriptions - Dashboard - StorySnatcher",
    description: "View and manage your saved transcriptions.",
  };
  
  export default function TranscriptionsPage() {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Transcriptions</h2>
        <Transcription />
      </div>
    );
  }
  