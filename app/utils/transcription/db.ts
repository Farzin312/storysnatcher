import { supabase } from "../client";

interface TranscriptRecord {
  userId: string;
  transcript: string;
  studyGuide?: string;
  source: string; // e.g. 'whisper', 'youtube', 'study-guide'
  transcriptName?: string; // New field for transcript name
}

export async function saveTranscriptToDB(record: TranscriptRecord) {
  // First, check if the transcript name already exists for this user
  const { data: existing, error: checkError } = await supabase
    .from("user_transcripts")
    .select("id")
    .eq("firebase_uid", record.userId)
    .eq("transcript_name", record.transcriptName);

  if (checkError) {
    console.error("Error checking for duplicate transcript name:", checkError);
    throw checkError;
  }

  if (existing.length > 0) {
    throw new Error("A transcript with this name already exists. Choose a different name.");
  }

  // Now insert the new transcript since it doesn't exist
  const { data, error } = await supabase
    .from("user_transcripts")
    .insert([
      {
        firebase_uid: record.userId,
        transcript_name: record.transcriptName,
        transcript: record.transcript,
        study_guide: record.studyGuide || null,
        source: record.source,
      },
    ]);

  if (error) {
    console.error("Supabase insert error:", error);
    throw error;
  }

  return data;
}
