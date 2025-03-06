import { NextResponse } from "next/server";
import { google } from "googleapis";
import FormData from "form-data";
import fetch from "node-fetch";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough, Readable } from "stream";

const GOOGLE_DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL!;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

if (!GOOGLE_DRIVE_FOLDER_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
  throw new Error("Missing Google Drive environment variables.");
}
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}

// Auth for Google Drive
const auth = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  undefined,
  GOOGLE_PRIVATE_KEY,
  ["https://www.googleapis.com/auth/drive"]
);
const drive = google.drive({ version: "v3", auth });

function bufferToStream(buffer: Buffer): Readable {
  const pass = new PassThrough();
  pass.end(buffer);
  return pass;
}

// 1) Upload file → Google Drive
async function uploadToDrive(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const streamBody = bufferToStream(buffer);

  const response = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: file.type,
      body: streamBody,
    },
  });

  return response.data.id || "";
}

// 2) Delete file from Google Drive
async function deleteFromDrive(fileId: string) {
  if (!fileId) return;
  await drive.files.delete({ fileId });
}

// 3) Stream Audio from Google Drive → Whisper (with language param)
async function streamDriveAudioToWhisper(fileId: string, language: string): Promise<string> {
  const driveResponse = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );
  const form = new FormData();
  form.append("file", driveResponse.data as NodeJS.ReadableStream, {
    filename: "inputaudio",
    contentType: "audio/mpeg",
  });
  form.append("model", "whisper-1");
  if (language) {
    form.append("language", language);
  }
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });
  if (!res.ok) {
    const errorTxt = await res.text();
    throw new Error(`OpenAI Whisper Error: ${errorTxt}`);
  }
  const data = await res.json();
  return data.text;
}

// 4) Convert video from GDrive → MP3 on-the-fly → Whisper
async function convertDriveVideoToWhisper(fileId: string, language: string): Promise<string> {
  const driveResponse = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );
  const outputStream = new PassThrough();

  // Wait for conversion to finish using the outputStream's finish event
  await new Promise<void>((resolve, reject) => {
    ffmpeg(driveResponse.data)
      .format("mp3")
      .audioCodec("libmp3lame")
      .on("error", (err) => reject(new Error(`ffmpeg error: ${err.message}`)))
      .pipe(outputStream, { end: true });
    outputStream.on("finish", () => resolve());
    outputStream.on("error", (err) => reject(err));
  });

  const form = new FormData();
  form.append("file", outputStream, {
    filename: "converted.mp3",
    contentType: "audio/mpeg",
  });
  form.append("model", "whisper-1");
  if (language) {
    form.append("language", language);
  }
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: form,
  });
  if (!res.ok) {
    const errorTxt = await res.text();
    throw new Error(`OpenAI Whisper Error: ${errorTxt}`);
  }
  const data = await res.json();
  return data.text;
}

// 5) Main POST handler
export async function POST(req: Request) {
  let fileId = "";

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Invalid content type. Must be multipart/form-data." },
        { status: 400 }
      );
    }
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!file.type) {
      throw new Error("Missing file type.");
    }
    const language = (formData.get("language") as string) || "en";
    // New field from the client to force media type selection:
    const mediaType = (formData.get("mediaType") as string) || "audio";

    // 1) Upload to GDrive
    console.log("[Server] Uploading to GDrive...");
    fileId = await uploadToDrive(file);
    if (!fileId) {
      throw new Error("Failed to upload file to Google Drive.");
    }

    // 2) Process file based on the user’s chosen media type.
    let transcript: string;
    if (mediaType === "video") {
      console.log("[Server] It's video => converting on the fly...");
      transcript = await convertDriveVideoToWhisper(fileId, language);
    } else {
      console.log("[Server] Treating file as audio => streaming directly...");
      transcript = await streamDriveAudioToWhisper(fileId, language);
    }

    // 3) Cleanup GDrive
    console.log("[Server] Deleting file from GDrive now...");
    await deleteFromDrive(fileId);
    fileId = "";

    // 4) Return the result
    return NextResponse.json({ transcript }, { status: 200 });
  } catch (err) {
    console.error("[Transcription Error]", err);
    if (fileId) {
      try {
        await deleteFromDrive(fileId);
      } catch (delErr) {
        console.error("[Server] Error deleting leftover GDrive file:", delErr);
      }
    }
    const msg = err instanceof Error ? err.message : "Unknown error occurred.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
