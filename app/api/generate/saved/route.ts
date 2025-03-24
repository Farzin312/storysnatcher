// app/api/generate/saved/route.ts
import { NextResponse } from "next/server";
import { getGenerations, updateGeneration, deleteGeneration, GenerationRecord } from "@/app/utils/generate/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    const records: GenerationRecord[] = await getGenerations(userId);
    return NextResponse.json(records, { status: 200 });
  } catch (error: unknown) {
    console.error("[Get Generation Error]", error);
    const errorMessage = (error as Error).message || "An error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const payload = await req.json();
    const { userId, id, ...updates } = payload;
    if (!userId || !id) {
      return NextResponse.json({ error: "Missing userId or id" }, { status: 400 });
    }
    const updatedRecord = await updateGeneration(id, updates, userId);
    return NextResponse.json(updatedRecord, { status: 200 });
  } catch (error: unknown) {
    console.error("[Update Generation Error]", error);
    const errorMessage = (error as Error).message || "An error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const id = searchParams.get("id");
    if (!userId || !id) {
      return NextResponse.json({ error: "Missing userId or id" }, { status: 400 });
    }
    await deleteGeneration(id, userId);
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("[Delete Generation Error]", error);
    const errorMessage = (error as Error).message || "An error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
