import { NextResponse } from "next/server";
import { OpenAI } from "openai";

interface QuizRequest {
  transcript?: string;
  instructions?: string;
  language?: string;
  multipleChoice?: number;
  shortAnswer?: number;
}

async function generateQuiz({
  openai,
  transcript,
  instructions,
  language,
  multipleChoice,
  shortAnswer,
}: QuizRequest & { openai: OpenAI }): Promise<string> {
  const totalQuestions = (multipleChoice || 0) + (shortAnswer || 0);
  // If the user selected a language other than English, note that the transcript is in English.
  const transcriptNotice = language && language !== "en" 
    ? "\n\nNote: The transcript is in English because the requested language was not available." 
    : "";
    
  const finalPrompt = `Generate a quiz with ${totalQuestions} questions based on the following transcript:
${transcript}${transcriptNotice}

Requirements:
- Multiple Choice Questions: ${multipleChoice || 0}. For each, provide 4 options with one correct answer.
- Short Answer Questions: ${shortAnswer || 0}.
Instructions: ${instructions}

Respond only in ${language}.`;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates quizzes with clear instructions for each question type.",
        },
        { role: "user", content: finalPrompt },
      ],
      max_tokens: 3000,
    });
    return completion.choices[0].message?.content || "";
  } catch (error) {
    console.error("OpenAI API error in generating quiz:", error);
    return "Error generating quiz.";
  }
}

export async function POST(req: Request) {
  const { transcript, instructions, language, multipleChoice, shortAnswer }: QuizRequest =
    await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 });
  }
  if (!transcript) {
    return NextResponse.json({ error: "Transcript is required for quiz generation." }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const quiz = await generateQuiz({
    openai,
    transcript,
    instructions,
    language: language || "en",
    multipleChoice,
    shortAnswer,
  });
  return NextResponse.json({ quiz });
}
