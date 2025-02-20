"use client";
import { useGenerate } from "../../generate/Context";

export default function AudioStep() {
  const { data, updateData } = useGenerate();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-black">
        Step 3: Generate Audio
      </h1>
      <p className="mb-4 text-gray-700">
        We&apos;ll create an audio track based on your summary text. The final audio
        length is automatically calculated from your summary&apos;s length.
      </p>

      <label className="block mb-2 text-black font-semibold">
        Voice Selection
      </label>
      <select
        className="p-2 mb-4 border border-gray-300 rounded text-black w-full"
        value={data.voice}
        onChange={(e) => updateData("voice", e.target.value)}
      >
        <option value="female">Female (Default)</option>
        <option value="male">Male</option>
      </select>

      <p className="text-gray-600 text-sm">
        Audio will be generated using TTS. You can change the voice if you&apos;d
        prefer a different sound.
      </p>
    </div>
  );
}
