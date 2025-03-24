import { supabase } from "@/app/utils/client";

export async function deleteSavedSummary(id: string) {
  const { data, error } = await supabase
    .from("user_summaries")
    .delete()
    .eq("id", id);
  if (error) {
    throw error;
  }
  return data;
}

export async function editSavedSummary(
  id: string,
  summary_name: string,
  summary: string,
  transcript_id?: number | null
) {
  const { data, error } = await supabase
    .from("user_summaries")
    .update({
      summary_name,
      summary,
      transcript_id: transcript_id || null,
    })
    .eq("id", id);
  if (error) {
    throw error;
  }
  return data;
}
