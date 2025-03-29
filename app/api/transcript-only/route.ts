import { NextResponse } from "next/server";

interface YoutubeTranscribeBody {
  youtubeUrl: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body: YoutubeTranscribeBody = await req.json();
    const { youtubeUrl } = body;
    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "youtubeUrl is required." },
        { status: 400 }
      );
    }

    // Replace with your actual Cloud Run service URL
    const cloudRunUrl =
      "https://transcript-667934783888.us-central1.run.app";

    const response = await fetch(cloudRunUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ youtubeUrl }),
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Cloud Run service error." },
        { status: response.status }
      );
    }

    return NextResponse.json({ transcript: data.transcript }, { status: 200 });
  } catch (err: unknown) {
    console.error("[YouTube Transcription Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
