import { supabase } from "@/app/utils/client";

export async function deleteSavedTranscript(id: number) {
  const { data, error } = await supabase
    .from("user_transcripts")
    .delete()
    .eq("id", id);
  if (error) {
    throw error;
  }
  return data;
}

export async function editSavedTranscript(
  id: number,
  transcript_name: string,
  transcript: string,
  study_guide?: string
) {
  const { data, error } = await supabase
    .from("user_transcripts")
    .update({
      transcript_name,
      transcript,
      study_guide: study_guide || null,
    })
    .eq("id", id);
  if (error) {
    throw error;
  }
  return data;
}
