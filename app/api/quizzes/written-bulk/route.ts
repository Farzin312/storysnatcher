import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export interface WrittenResponseItem {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

interface BulkWrittenRequestBody {
  quizId: string;
  responses: WrittenResponseItem[];
}

// Use the same updated extraction function
function extractJson(text: string): string {
  const codeFenceMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (codeFenceMatch && codeFenceMatch[1]) {
    return codeFenceMatch[1].trim();
  }
  const trimmed = text.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed;
  }
  const objectMatches = text.match(/{[\s\S]*?}/g);
  if (objectMatches && objectMatches.length > 0) {
    return `[${objectMatches.join(",")}]`;
  }
  throw new Error("Could not find JSON array boundaries in the response.");
}

export async function POST(req: Request) {
  try {
    const { quizId, responses }: BulkWrittenRequestBody = await req.json();
    if (!responses || responses.length === 0) {
      return NextResponse.json({ error: "No responses provided." }, { status: 400 });
    }
    const processedResponses = responses.map(item => ({
      ...item,
      userAnswer:
        item.userAnswer && item.userAnswer.trim() !== ""
          ? item.userAnswer
          : "No answer provided"
    }));
    let prompt = `Quiz ID: ${quizId}\n`;
    prompt += `You are an expert quiz evaluator. Evaluate the following **written** responses. For each question, provide a score (0 to 100) and detailed, insightful feedback on how to improve. Use markdown formatting (e.g., **bold** for key points) and write in the same language as the question. Label each response with its question number and include the original question text.\n\n`;
    prompt += `Return your answer as raw JSON only, as an array of objects with the following format:\n`;
    prompt += `[{"questionId": "<id>", "questionNumber": <number>, "questionText": "<question text>", "score": <number>, "feedback": "Markdown formatted feedback"}]\n\n`;
    processedResponses.forEach((item, idx) => {
      prompt += `${idx + 1}. Question: ${item.question}\nUser Answer: ${item.userAnswer}\nCorrect Answer: ${item.correctAnswer || "No correct answer provided"}\n\n`;
    });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: "You are an expert evaluator for written quiz responses." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
    });
    let responseText = completion.choices?.[0]?.message?.content?.trim() || "";
    responseText = extractJson(responseText);
    try {
      const evaluations: {
        questionId: string;
        questionNumber: number;
        questionText: string;
        score: number;
        feedback: string;
      }[] = JSON.parse(responseText);
      return NextResponse.json(evaluations, { status: 200 });
    } catch {
      throw new Error("Failed to parse written bulk evaluation result: " + responseText);
    }
  } catch (error) {
    console.error("Written Bulk Evaluation Error:", error);
    return NextResponse.json({ error: "Unknown error occurred in written bulk evaluation." }, { status: 500 });
  }
}
