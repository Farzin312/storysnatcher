import { NextResponse } from "next/server";
import { fetchYoutubeTranscript, translateTranscript } from "@/app/utils/transcription/youtube";

interface YoutubeTranscribeBody {
  youtubeUrl: string;
  language?: string;
}

export async function POST(req: Request) {
  try {
    const body: YoutubeTranscribeBody = await req.json();
    const { youtubeUrl, language = "en" } = body;
    if (!youtubeUrl) {
      return NextResponse.json({ error: "youtubeUrl is required." }, { status: 400 });
    }
    const transcript = await fetchYoutubeTranscript(youtubeUrl);
    let finalTranscript = transcript;
    if (language !== "en") {
      finalTranscript = await translateTranscript(transcript, language);
    }
    return NextResponse.json({ transcript: finalTranscript }, { status: 200 });
  } catch (err) {
    console.error("[YouTube Transcription Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
