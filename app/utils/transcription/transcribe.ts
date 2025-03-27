// not in use at this moment due to storage issues
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

async function deleteFromDrive(fileId: string) {
  if (!fileId) return;
  await drive.files.delete({ fileId });
}

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
  if (language) form.append("language", language);
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

async function convertDriveVideoToWhisper(fileId: string, language: string): Promise<string> {
  const driveResponse = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );
  const outputStream = new PassThrough();
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
  if (language) form.append("language", language);
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

const CHUNK_SIZE = 25 * 1024 * 1024; // 25 MB

export async function transcribeAudio(file: File, language: string): Promise<string> {
  if (file.size <= CHUNK_SIZE) {
    const fileId = await uploadToDrive(file);
    try {
      return await streamDriveAudioToWhisper(fileId, language);
    } finally {
      await deleteFromDrive(fileId);
    }
  } else {
    // Split file into chunks and transcribe each
    let transcripts = "";
    let start = 0;
    let index = 0;
    while (start < file.size) {
      const chunk = file.slice(start, start + CHUNK_SIZE, file.type);
      // Name the chunk uniquely
      const chunkFile = new File([chunk], `${file.name}-part${index}`, { type: file.type });
      const fileId = await uploadToDrive(chunkFile);
      try {
        const chunkTranscript = await streamDriveAudioToWhisper(fileId, language);
        transcripts += chunkTranscript + " ";
      } finally {
        await deleteFromDrive(fileId);
      }
      start += CHUNK_SIZE;
      index++;
    }
    return transcripts.trim();
  }
}

export async function transcribeVideo(file: File, language: string): Promise<string> {
  if (file.size <= CHUNK_SIZE) {
    const fileId = await uploadToDrive(file);
    try {
      return await convertDriveVideoToWhisper(fileId, language);
    } finally {
      await deleteFromDrive(fileId);
    }
  } else {
    // Split video into chunks and transcribe each
    let transcripts = "";
    let start = 0;
    let index = 0;
    while (start < file.size) {
      const chunk = file.slice(start, start + CHUNK_SIZE, file.type);
      const chunkFile = new File([chunk], `${file.name}-part${index}`, { type: file.type });
      const fileId = await uploadToDrive(chunkFile);
      try {
        const chunkTranscript = await convertDriveVideoToWhisper(fileId, language);
        transcripts += chunkTranscript + " ";
      } finally {
        await deleteFromDrive(fileId);
      }
      start += CHUNK_SIZE;
      index++;
    }
    return transcripts.trim();
  }
}
