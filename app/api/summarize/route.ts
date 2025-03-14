import { NextResponse } from "next/server";
import { generateSummary } from "../../utils/summary/summarize";
import { supabase } from "@/app/utils/client"; 

interface SummarizeRequest {
  youtubeUrl?: string;
  transcriptId?: string;
  language?: string;
  summaryType?: string;
  customPrompt?: string;
}

export async function POST(req: Request) {
  try {
    const {
      youtubeUrl,
      transcriptId,
      language = "en",
      summaryType = "concise",
      customPrompt = "",
    }: SummarizeRequest = await req.json();
    let transcript = "";
    if (youtubeUrl) {
      const { fetchYoutubeTranscript } = await import("@/app/utils/transcription/youtube");
      transcript = await fetchYoutubeTranscript(youtubeUrl);
    } else if (transcriptId) {
      // Directly query Supabase for the transcript
      const { data, error } = await supabase
        .from("user_transcripts")
        .select("transcript")
        .eq("id", transcriptId)
        .single();
      if (error || !data) {
        return NextResponse.json({ error: "Error fetching saved transcript." }, { status: 500 });
      }
      transcript = data.transcript;
    } else {
      return NextResponse.json({ error: "Either youtubeUrl or transcriptId is required." }, { status: 400 });
    }
    // Use the requested language without forcing english.
    const summaryResult = await generateSummary(transcript, language, summaryType, customPrompt);
    return NextResponse.json({ summary: summaryResult }, { status: 200 });
  } catch (err) {
    console.error("[Summarization Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
