import { NextResponse } from "next/server";
import { fetchYoutubeTranscript } from "@/app/utils/transcription/youtube";

interface YoutubeTranscribeBody {
  youtubeUrl: string;
}

export async function POST(req: Request) {
  try {
    const body: YoutubeTranscribeBody = await req.json();
    const { youtubeUrl } = body;
    if (!youtubeUrl) {
      return NextResponse.json({ error: "youtubeUrl is required." }, { status: 400 });
    }
    const transcript = await fetchYoutubeTranscript(youtubeUrl);
    return NextResponse.json({ transcript }, { status: 200 });
  } catch (err) {
    console.error("[YouTube Transcription Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
