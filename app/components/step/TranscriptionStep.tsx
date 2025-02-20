"use client";
import { useGenerate } from "../../generate/Context";

export default function TranscriptionStep() {
  const { data, updateData } = useGenerate();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, you might upload the file to your server or S3,
      // then store the resulting URL in context
      const file = e.target.files[0];
      updateData("videoSource", file.name); // or a custom upload
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">Step 1: Transcription</h1>

      {/* Language Selection */}
      <label className="block mb-2 text-black font-semibold">Transcription Language</label>
      <select
        className="p-2 border border-gray-300 rounded text-black w-full mb-4"
        value={data.language}
        onChange={(e) => updateData("language", e.target.value)}
      >
        <option value="English">English</option>
        <option value="Spanish">Spanish</option>
        <option value="French">French</option>
        {/* Add more as you like */}
      </select>

      {/* File Upload */}
      <label className="block mb-2 text-black font-semibold">Upload Video</label>
      <input
        type="file"
        accept="video/*"
        className="mb-4"
        onChange={handleFileUpload}
      />

      {/* Or Provide a URL */}
      <label className="block mb-2 text-black font-semibold">
        Or Provide Video URL
      </label>
      <input
        type="text"
        className="p-2 border border-gray-300 rounded text-black w-full mb-4"
        placeholder="e.g. https://example.com/video.mp4"
        value={data.videoSource}
        onChange={(e) => updateData("videoSource", e.target.value)}
      />

      <p className="text-gray-600 text-sm">
        If an AI can transcribe from URL for free, we will do so. Otherwise, 
        please upload your video, and we&apos;ll handle transcription locally.
      </p>
    </div>
  );
}
