import { NextResponse } from "next/server";
import { transcribeAudio, transcribeVideo } from "@/app/utils/transcription/transcribe";
import { translateTranscript } from "@/app/utils/transcription/youtube"; // <-- import translation function

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type. Must be multipart/form-data." },
        { status: 400 }
      );
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!file.type) {
      throw new Error("Missing file type.");
    }
    const language = (formData.get("language") as string) || "en";
    const mediaType = (formData.get("mediaType") as string) || "audio";

    let transcript: string;
    if (mediaType === "video") {
      transcript = await transcribeVideo(file, language);
    } else {
      transcript = await transcribeAudio(file, language);
    }
    // If the selected language isn’t English, translate the transcript
    if (language !== "en") {
      transcript = await translateTranscript(transcript, language);
    }
    return NextResponse.json({ transcript }, { status: 200 });
  } catch (err) {
    console.error("[Transcription Error]", err);
    const msg = err instanceof Error ? err.message : "Unknown error occurred.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
