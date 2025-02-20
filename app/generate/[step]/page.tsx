"use client";
import { useRouter, useParams } from "next/navigation";
import { useGenerate } from "../Context";
import {
  TranscriptionStep,
  SummaryStep,
  AudioStep,
  VideoStep,
} from "../../components/step";
import { Button, ProgressBar } from "../../components/reusable";

const stepComponents: Record<string, React.FC> = {
  transcribe: TranscriptionStep,
  summary: SummaryStep,
  audio: AudioStep,
  video: VideoStep,
};

export default function StepPage() {
  const { setStep } = useGenerate();
  const { step: stepParam } = useParams();
  const router = useRouter();

  const StepComponent = stepComponents[stepParam as string];
  if (!StepComponent) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-white">
        <p className="text-red-500 text-xl">Invalid step</p>
      </div>
    );
  }

  const stepKeys = Object.keys(stepComponents);
  const currentStepIndex = stepKeys.indexOf(stepParam as string);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white">
      <div className="max-w-3xl mx-auto p-6">
        {/* Progress Bar */}
        <ProgressBar />

        {/* The Actual Step Component */}
        <StepComponent />

        {/* Back / Next Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="default"
            disabled={currentStepIndex === 0}
            onClick={() => {
              const prevStep = stepKeys[currentStepIndex - 1];
              setStep(currentStepIndex);
              router.push(`/generate/${prevStep}`);
            }}
          >
            Back
          </Button>

          <Button
            variant="default"
            disabled={currentStepIndex === stepKeys.length - 1}
            onClick={() => {
              const nextStep = stepKeys[currentStepIndex + 1];
              setStep(currentStepIndex + 2);
              router.push(`/generate/${nextStep}`);
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
