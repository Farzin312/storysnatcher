import { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
if (!YOUTUBE_API_KEY) {
  throw new Error("Missing YOUTUBE_API_KEY environment variable.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Extracts the video ID from a YouTube URL.
 * @param youtubeUrl The URL of the YouTube video.
 * @returns The video ID as a string.
 */
function extractVideoId(youtubeUrl: string): string {
  try {
    const url = new URL(youtubeUrl);
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1);
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return id;
    }
    throw new Error("Invalid YouTube URL");
  } catch {
    throw new Error("Failed to parse YouTube URL.");
  }
}

/**
 * Fetches the transcript from a YouTube video using the third‑party API.
 * Joins all transcript segments' text (ignoring start and duration).
 * @param youtubeUrl The URL of the YouTube video.
 * @returns The combined transcript text.
 */
export async function fetchYoutubeTranscript(youtubeUrl: string): Promise<string> {
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    throw new Error("Could not extract video ID from the provided YouTube URL.");
  }

  try {
    const response = await fetch("https://www.youtube-transcript.io/api/transcripts", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${YOUTUBE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ids: [videoId] })
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      interface TranscriptItem {
        id: string;
        tracks?: Array<{
          transcript?: Array<{ text?: string; start?: string; dur?: string }>;
          text?: string;
        }>;
      }
      const transcriptObj = (data as TranscriptItem[]).find((item) => item.id === videoId);
      if (transcriptObj && Array.isArray(transcriptObj.tracks)) {
       

        const transcript = transcriptObj.tracks
          .map((track) => {
            if (Array.isArray(track.transcript)) {
              // If the track has a transcript array, join all segment texts.
              return track.transcript
                .map((seg) => (typeof seg.text === "string" ? seg.text.trim() : ""))
                .filter((t) => t.length > 0)
                .join(" ");
            } else if (typeof track.text === "string") {
              return track.text.trim();
            }
            return "";
          })
          .filter((t) => t.length > 0)
          .join(" ");
          
        if (transcript.trim().length === 0) {
          console.error("No transcript text found in tracks:", transcriptObj.tracks);
          throw new Error("Transcript tracks are empty.");
        }
        return transcript;
      }
    }
    
    console.error("Unexpected API response structure:", data);
    throw new Error("Transcript not found in API response.");
  } catch (error) {
    console.error("Error fetching YouTube transcript:", error);
    throw new Error("Failed to fetch transcript from YouTube.");
  }
}

/**
 * Splits the input text into chunks of a given maximum size.
 * @param text The text to split.
 * @param chunkSize Maximum number of characters per chunk.
 * @returns An array of text chunks.
 */
function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Translates a single chunk into the target language.
 * @param chunk The text chunk.
 * @param targetLanguage The target language.
 * @returns The translated text.
 */
async function translateChunk(chunk: string, targetLanguage: string): Promise<string> {
  const prompt = `Translate the following transcript text into ${targetLanguage} while preserving the original meaning, and return the result as plain text:\n\n${chunk}`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a translation assistant." },
      { role: "user", content: prompt }
    ],
    max_tokens: 1000,
  });
  return completion?.choices?.[0]?.message?.content?.trim() || "";
}

/**
 * Translates a long transcript by splitting it into chunks and translating each concurrently.
 * @param transcript The full transcript.
 * @param targetLanguage The target language.
 * @param chunkSize Maximum characters per chunk (default 4000).
 * @returns The translated transcript.
 */
export async function translateTranscriptInChunks(
  transcript: string,
  targetLanguage: string,
  chunkSize = 4000
): Promise<string> {
  const chunks = splitIntoChunks(transcript, chunkSize);
  const translatedChunks: string[] = await Promise.all(
    chunks.map((chunk) => translateChunk(chunk, targetLanguage))
  );
  return translatedChunks.join(" ");
}

/**
 * Translates the transcript if needed. Uses chunking if the transcript is long.
 * @param transcript The transcript.
 * @param targetLanguage The target language.
 * @returns The translated transcript.
 */
export async function translateTranscript(transcript: string, targetLanguage: string): Promise<string> {
  if (transcript.length > 4000) {
    return translateTranscriptInChunks(transcript, targetLanguage);
  } else {
    return translateChunk(transcript, targetLanguage);
  }
}
