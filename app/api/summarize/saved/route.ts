import { NextResponse } from "next/server";
import { deleteSavedSummary, editSavedSummary } from "@/app/utils/summary/saved";
import { getUserSummaries } from "@/app/utils/summary/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId query parameter is required." }, { status: 400 });
  }

  try {
    const summaries = await getUserSummaries(userId);
    return NextResponse.json({ summaries }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, summary_name, summary, transcript_id } = await req.json();
    if (!id || !summary_name || !summary) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    await editSavedSummary(id, summary_name, summary, transcript_id);
    return NextResponse.json({ message: "Summary updated successfully." }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Summary id is required." }, { status: 400 });
    }
    await deleteSavedSummary(id);
    return NextResponse.json({ message: "Summary deleted successfully." }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
