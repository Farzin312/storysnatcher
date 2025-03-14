import { YoutubeTranscript } from "youtube-transcript";
import { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Fetches the transcript from a YouTube video.
 * @param youtubeUrl The URL of the YouTube video.
 * @returns The combined transcript text.
 */
export async function fetchYoutubeTranscript(youtubeUrl: string): Promise<string> {
  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript(youtubeUrl);
    return transcriptArray.map((t) => t.text).join(" ");
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
