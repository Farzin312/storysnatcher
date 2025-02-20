"use client";
import { useGenerate } from "../../generate/Context";

export default function VideoStep() {
  const { data, updateData } = useGenerate();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">
        Step 4: Generate Video (Paid Feature)
      </h1>
      <p className="mb-4 text-gray-700">
        Provide a description of the style or theme you want for the final
        video. We&apos;ll combine your summary & audio if needed.
      </p>

      <label className="block mb-2 text-black font-semibold">
        Video Description
      </label>
      <textarea
        className="w-full p-2 h-24 border border-gray-300 rounded text-black"
        placeholder="e.g. An animated summary with a calm, friendly tone..."
        value={data.videoDescription}
        onChange={(e) => updateData("videoDescription", e.target.value)}
      />

      <p className="text-gray-600 text-sm mt-2">
        Note: Only available to premium members.
      </p>
    </div>
  );
}
