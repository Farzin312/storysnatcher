"use client";
import { useGenerate } from "@/app/generate/Context";

export default function ProgressBar() {
  const { step } = useGenerate();
  const totalSteps = 4;
  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mt-4 mb-6">
      <div
        className="bg-green-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progressPercent}%` }}
      ></div>
    </div>
  );
}
