import { NextResponse } from "next/server";
import { supabase } from "@/app/utils/client";
import { deleteSavedTranscript, editSavedTranscript } from "@/app/utils/transcription/saved";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId query parameter is required." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_transcripts")
    .select("*")
    .eq("firebase_uid", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching saved transcripts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ transcripts: data ?? [] }, { status: 200 });
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Transcript id is required." }, { status: 400 });
    }
    await deleteSavedTranscript(id);
    return NextResponse.json({ message: "Transcript deleted successfully." }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting transcript:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, transcript_name, transcript, study_guide } = await req.json();
    if (!id || !transcript_name || !transcript) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    await editSavedTranscript(id, transcript_name, transcript, study_guide);
    return NextResponse.json({ message: "Transcript updated successfully." }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error editing transcript:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
