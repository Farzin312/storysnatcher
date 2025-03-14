import { NextResponse } from "next/server";
import { generateStudyGuide } from "@/app/utils/transcription/studyGuide";

interface StudyGuideRequest {
  transcript: string;
  language?: string;
}

export async function POST(req: Request) {
  try {
    const { transcript, language = "en" } = (await req.json()) as StudyGuideRequest;
    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript is required to generate a study guide." },
        { status: 400 }
      );
    }
    const studyGuide = await generateStudyGuide(transcript, language);
    return NextResponse.json({ studyGuide }, { status: 200 });
  } catch (err) {
    console.error("[Study Guide Generation Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
