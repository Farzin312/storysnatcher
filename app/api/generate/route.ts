export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY!;
if (!YOUTUBE_API_KEY) {
  throw new Error("Missing YOUTUBE_API_KEY environment variable.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// --- Interface Definitions ---
interface Flashcard {
  id: string;
  question: string;
  answer: string;
  isFlipped: boolean;
  isLocked: boolean;
}

interface QuizMCQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizSAQuestion {
  id: string;
  question: string;
  answer: string;
}

interface QuizResult {
  mc: QuizMCQuestion[];
  sa: QuizSAQuestion[];
}

// For the request payload
interface GenerationPayload {
  existingTranscript?: string;
  transcriptionMethod?: "youtube" | "file";
  youtubeUrl?: string;
  language?: string;
  flashcardPrompt: string;
  flashcardQuantity: number;
  quizPrompt: string;
  mcCount: number;
  saCount: number;
  wantsSummary: boolean;
  summaryType: "concise" | "detailed" | "bullet" | "custom";
  customSummaryPrompt: string;
  autoDownload: boolean;
}

// --- Transcript Retrieval Logic using Third‑Party API ---
// (Helper functions are now internal and not exported)

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

async function fetchYoutubeTranscript(youtubeUrl: string): Promise<string> {
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

// For backward compatibility, define transcribeYouTube to use our new function.
async function transcribeYouTube(url: string): Promise<string> {
  return await fetchYoutubeTranscript(url);
}

// --- Summaries ---
async function generateSummaryStep(
  transcript: string,
  summaryType: "concise" | "detailed" | "bullet" | "custom",
  customPrompt: string,
  summaryLanguage: string
): Promise<string> {
  let instruction: string;
  switch (summaryType) {
    case "custom":
      instruction = customPrompt || "Summarize the following text";
      break;
    case "detailed":
      instruction = "Provide a detailed summary";
      break;
    case "bullet":
      instruction = "Provide a bullet-point summary";
      break;
    default:
      instruction = "Provide a concise summary";
      break;
  }

  const finalPrompt = `${instruction} of the following text. Generate a single summary and return it as plain text without any markdown formatting. Respond only in ${summaryLanguage}.

Text:
${transcript}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant that summarizes text." },
      { role: "user", content: finalPrompt },
    ],
    max_tokens: 1500,
  });

  let responseText: string = completion.choices[0].message?.content ?? "";
  responseText = responseText.replace(/```(json)?/g, "").trim();
  return responseText;
}

// --- Flashcards ---
async function generateFlashcardsStep(
  transcript: string,
  instructions: string,
  language: string,
  cardQuantity: number
): Promise<Flashcard[]> {
  const finalPrompt = `Generate ${cardQuantity} flashcards based on the following transcript.
  
Transcript:
${transcript}

Instructions: ${instructions}
  
Return a JSON array of objects in the format [{"question": "...", "answer": "..." }]. Respond only in ${language} and do not include any markdown formatting.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant that creates flashcards." },
      { role: "user", content: finalPrompt },
    ],
    max_tokens: 2000,
  });

  let responseText: string = completion.choices[0].message?.content ?? "";
  responseText = responseText.replace(/```(json)?/g, "").trim();

  try {
    const cardsData = JSON.parse(responseText);
    return cardsData.map((card: { question: string; answer: string }, idx: number) => ({
      id: `flashcard-${Date.now()}-${idx}`,
      question: card.question,
      answer: card.answer,
      isFlipped: false,
      isLocked: false,
    }));
  } catch {
    return [];
  }
}

// --- Quiz ---
async function generateQuizStep(
  transcript: string,
  instructions: string,
  language: string,
  multipleChoice: number,
  shortAnswer: number
): Promise<QuizResult> {
  const finalPrompt = `Based on the following transcript, generate a quiz. The quiz should include ${multipleChoice} multiple choice questions and ${shortAnswer} short answer questions.

For multiple choice questions, each question must be an object with:
- "question": a string containing the question,
- "options": an array of exactly 4 answer options,
- "correctAnswer": a string that matches one of the options.

For short answer questions, each question must be an object with:
- "question": a string containing the question,
- "answer": a string containing the answer.

Transcript:
${transcript}

Instructions: ${instructions}

Return a valid JSON object with two keys: "mc" (an array of multiple choice questions) and "sa" (an array of short answer questions). Do not include any additional text or markdown formatting.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant that generates quizzes." },
      { role: "user", content: finalPrompt },
    ],
    max_tokens: 3000,
  });

  let responseText: string = completion.choices[0].message?.content ?? "";
  responseText = responseText.replace(/```(json)?/g, "").trim();

  try {
    const quizData = JSON.parse(responseText);
    const mc: QuizMCQuestion[] = Array.isArray(quizData.mc)
      ? quizData.mc.map((q: { question: string; options: string[]; correctAnswer: string }, idx: number) => ({
          id: `quiz-mc-${Date.now()}-${idx}`,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        }))
      : [];
    const sa: QuizSAQuestion[] = Array.isArray(quizData.sa)
      ? quizData.sa.map((q: { question: string; answer: string }, idx: number) => ({
          id: `quiz-sa-${Date.now()}-${idx}`,
          question: q.question,
          answer: q.answer,
        }))
      : [];
      
    if (mc.length === 0 && sa.length === 0) {
      throw new Error("Quiz generation failed: No quiz questions were generated.");
    }
      
    return { mc, sa };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz questions.");
  }
}

// --- Unified POST Handler ---
// Only the POST handler is exported from this file.
export async function POST(req: Request): Promise<Response> {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Use JSON (application/json) to call this route." },
        { status: 400 }
      );
    }

    const payload = (await req.json()) as GenerationPayload;

    // 1. Figure out how we get the transcript
    let transcript = "";
    if (payload.existingTranscript) {
      transcript = payload.existingTranscript;
    } else if (payload.transcriptionMethod === "youtube" && payload.youtubeUrl) {
      try {
        new URL(payload.youtubeUrl);
      } catch {
        return NextResponse.json({ error: "Invalid YouTube URL provided." }, { status: 400 });
      }
      transcript = await transcribeYouTube(payload.youtubeUrl);
    } else {
      return NextResponse.json(
        { error: "No existing transcript or valid YouTube URL provided." },
        { status: 400 }
      );
    }

    // 2. Generate summary if requested
    let summaryResult = "";
    if (payload.wantsSummary) {
      summaryResult = await generateSummaryStep(
        transcript,
        payload.summaryType,
        payload.customSummaryPrompt,
        payload.language || "en"
      );
    }

    // 3. Generate flashcards
    const flashcards = await generateFlashcardsStep(
      transcript,
      payload.flashcardPrompt,
      payload.language || "en",
      payload.flashcardQuantity
    );

    // 4. Generate quiz questions
    let quizResult: QuizResult;
    try {
      quizResult = await generateQuizStep(
        transcript,
        payload.quizPrompt,
        payload.language || "en",
        payload.mcCount,
        payload.saCount
      );
    } catch (quizError) {
      return NextResponse.json(
        { error: quizError instanceof Error ? quizError.message : "Failed to generate quiz questions." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transcript,
      summary: summaryResult,
      flashcards,
      quizMC: quizResult.mc,
      quizSA: quizResult.sa,
    });
  } catch (err: unknown) {
    console.error("[Unified Generate Error]", err);
    const msg = err instanceof Error ? err.message : "Unknown error occurred.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
