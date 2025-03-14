import { NextResponse } from "next/server";
import { supabase } from "@/app/utils/client"; 

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
