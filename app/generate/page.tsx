"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGenerate } from "./Context";
import { Spinner } from "../components/reusable";

export default function GeneratePage() {
  const router = useRouter();
  const { step } = useGenerate();

  useEffect(() => {
    const stepRoutes = [
      "/generate/transcribe",
      "/generate/summary",
      "/generate/audio",
      "/generate/video",
    ];
    router.push(stepRoutes[step - 1]);
  }, [step, router]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-white">
      <Spinner />
    </div>
  );
}
