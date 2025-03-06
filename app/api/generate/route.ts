// File: /app/api/generate/route.ts
import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}

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

// --- YouTube Transcription Function ---
async function transcribeYouTube(url: string): Promise<string> {
  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript(url);
    return transcriptArray.map((t) => t.text).join(" ");
  } catch (error) {
    console.error("Error fetching YouTube transcript:", error);
    throw new Error("Failed to fetch transcript from YouTube.");
  }
}

// --- OpenAI Setup ---
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

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
  const finalPrompt = `Generate a quiz based on the following transcript. Respond only in ${language} and do not include any markdown formatting.

Transcript:
${transcript}

Requirements:
- Provide ${multipleChoice} multiple choice questions. For each, return an object with "question", an array "options" (4 options), and "correctAnswer".
- Provide ${shortAnswer} short answer questions. For each, return an object with "question" and "answer".
Instructions: ${instructions}

Return a JSON object with two keys: "mc" (for multiple choice) and "sa" (for short answer).`;

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
    return { mc, sa };
  } catch {
    return { mc: [], sa: [] };
  }
}

// --- Unified POST Handler ---
export async function POST(req: Request): Promise<Response> {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Use JSON (application/json) to call this route." },
        { status: 400 }
      );
    }

    // Cast the parsed JSON to our GenerationPayload interface
    const payload = (await req.json()) as GenerationPayload;

    // 1. Figure out how we get the transcript
    let transcript = "";

    // (A) If the user provided an existing transcript (from the file route)
    if (payload.existingTranscript) {
      transcript = payload.existingTranscript;
    }
    // (B) Otherwise, if they are using YouTube transcription
    else if (payload.transcriptionMethod === "youtube" && payload.youtubeUrl) {
      transcript = await transcribeYouTube(payload.youtubeUrl);
    }
    // (C) Otherwise, no transcript
    else {
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

    // 4. Generate quiz
    const quizResult = await generateQuizStep(
      transcript,
      payload.quizPrompt,
      payload.language || "en",
      payload.mcCount,
      payload.saCount
    );

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
