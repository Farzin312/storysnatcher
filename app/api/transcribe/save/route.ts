import { NextResponse } from "next/server";
import { saveTranscriptToDB } from "@/app/utils/transcription/db";
import { verifyFirebaseToken } from "@/app/utils/firebase-server";

interface SaveTranscriptRequest {
  transcript: string;
  studyGuide?: string;
  source: string;
  transcriptName?: string; // New field for transcript name
}

export async function POST(req: Request) {
  try {
    const body: SaveTranscriptRequest = await req.json();
    const { transcript, studyGuide, source, transcriptName } = body;
    if (!transcript || !source) {
      return NextResponse.json({ error: "Transcript and source are required." }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.split("Bearer ")[1];
      if (token) {
        userId = await verifyFirebaseToken(token);
      }
    }
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await saveTranscriptToDB({ userId, transcript, studyGuide, source, transcriptName });
    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("[Save Transcript Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
