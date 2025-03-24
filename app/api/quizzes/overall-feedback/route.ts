import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface OverallFeedbackRequestBody {
  quizId: string;
  feedbacks: { questionId: string; feedback: string }[];
}

export async function POST(req: Request) {
  try {
    const { quizId, feedbacks }: OverallFeedbackRequestBody = await req.json();
    const _quizId = quizId;
    if (!feedbacks || feedbacks.length === 0) {
      return NextResponse.json({ error: "No feedback provided." }, { status: 400 });
    }
    let prompt = `Quiz ID: ${_quizId}\nYou are an expert quiz evaluator. Based on the following detailed feedback for each question, provide a general overall evaluation of the quiz performance. Your evaluation should clearly state what was done well, what needs improvement, and provide actionable suggestions.\n\n`;
    prompt += `Return your answer as plain text in markdown format, ensuring that only the header **General Feedback:** is bolded. For example, your output should start with:\n\n**General Feedback:**\nYour overall evaluation text...\n\n`;
    feedbacks.forEach((item, idx) => {
      prompt += `${idx + 1}. ${item.feedback}\n\n`;
    });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        { role: "system", content: "You are an expert evaluator for quiz performance." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
    });
    const responseText = completion.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ generalFeedback: responseText }, { status: 200 });
  } catch (error) {
    console.error("Overall Feedback Evaluation Error:", error);
    return NextResponse.json({ error: "Unknown error occurred in overall feedback evaluation." }, { status: 500 });
  }
}
