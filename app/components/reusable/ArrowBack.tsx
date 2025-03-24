"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";

interface ArrowBackProps {
  examStarted?: boolean;
  examFinished?: boolean;
}

export default function ArrowBack({ examStarted, examFinished }: ArrowBackProps) {
  const router = useRouter();

  const handleBack = () => {
    if (examStarted && !examFinished) {
      const confirmLeave = confirm(
        "If you go back now, your quiz will be restarted. Continue?"
      );
      if (!confirmLeave) {
        return;
      }
    }
    router.back();
  };

  return (
    <Button variant="outline" onClick={handleBack}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 inline-block mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </Button>
  );
}
