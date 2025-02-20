"use client";
import { useGenerate } from "../../generate/Context";

export default function SummaryStep() {
  const { data, updateData } = useGenerate();
  const hasTranscript = data.transcript.trim().length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">
        Step 2: Summarize the Content
      </h1>

      {/* If there's no transcript, hint user might want to go back */}
      {!hasTranscript && (
        <p className="mb-4 text-red-500">
          It looks like you don&apos;t have a transcript yet. Please go back and
          transcribe your video, or ensure a direct link is valid for AI
          summarization.
        </p>
      )}

      <label className="block mb-2 text-black font-semibold">
        Summary Type
      </label>
      <select
        className="p-2 mb-4 border border-gray-300 rounded text-black w-full"
        value={data.summaryType}
        onChange={(e) => updateData("summaryType", e.target.value)}
      >
        <option value="concise">Concise</option>
        <option value="detailed">Detailed</option>
        <option value="bullet">Bullet Points</option>
      </select>

      <p className="text-gray-600 text-sm">
        We&apos;ll attempt to use Gemini Flash 2.0 for summarization if available;
        otherwise, we&apos;ll fallback to GPT-3.5 or an alternative model.
      </p>
    </div>
  );
}
