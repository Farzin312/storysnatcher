import { supabase } from "../client";

interface SummaryRecord {
  id: string;
  firebase_uid: string;
  transcript_id: number | null;
  summary: string;
  summary_name: string;
  created_at: string;
}

export async function saveSummaryToDB(record: {
  userId: string;
  transcriptId?: string;
  summary: string;
  summaryName: string;
}): Promise<SummaryRecord[]> {
  const { data, error } = await supabase
    .from("user_summaries")
    .insert([
      {
        firebase_uid: record.userId,
        transcript_id: record.transcriptId ? parseInt(record.transcriptId) : null,
        summary: record.summary,
        summary_name: record.summaryName,
      },
    ])
    .select();

  if (error) {
    console.error("Supabase insert error:", error);
    throw error;
  }
  if (!data) {
    throw new Error("No data returned from supabase insert.");
  }
  return data;
}

export async function getUserSummaries(userId: string): Promise<SummaryRecord[]> {
  const { data, error } = await supabase
    .from("user_summaries")
    .select("*")
    .eq("firebase_uid", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching user summaries:", error);
    throw error;
  }
  return data ?? [];
}
