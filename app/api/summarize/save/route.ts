import { NextResponse } from "next/server";
import { saveSummaryToDB, getUserSummaries } from "../../../utils/summary/db";

export async function POST(req: Request) {
  try {
    const { userId, transcriptId, summary, summaryName } = await req.json();
    // Check for duplicate summary names for this user.
    const existingSummaries = await getUserSummaries(userId);
    if (existingSummaries.some((s) => s.summary_name === summaryName)) {
      return NextResponse.json(
        { error: "A summary with that name already exists. Please choose a different name." },
        { status: 400 }
      );
    }
    const records = await saveSummaryToDB({ userId, transcriptId, summary, summaryName });
    return NextResponse.json({ summary: records[0] }, { status: 200 });
  } catch (err) {
    console.error("[Save Summary Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred." },
      { status: 500 }
    );
  }
}
