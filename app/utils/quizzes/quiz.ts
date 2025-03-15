import { OpenAI } from "openai";
import { QuizMCQuestion } from "@/app/components/reusable/MultipleChoice";
import { QuizSAQuestion } from "@/app/components/reusable/WrittenResponse";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface GenerateQuizzesParams {
  transcript: string;
  instructions: string;
  language: string;
  quizType: "mc" | "sa" | "both";
  cardQuantity: number;
}

export interface QuizGenerationResult {
  multipleChoice?: QuizMCQuestion[];
  writtenResponse?: QuizSAQuestion[];
}

/**
 * Extracts a balanced JSON substring from text by scanning for matching brackets.
 */
function extractBalancedJson(text: string): string | null {
  const stack: string[] = [];
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "{" || char === "[") {
      if (stack.length === 0) {
        start = i;
      }
      stack.push(char);
    } else if (char === "}" || char === "]") {
      if (stack.length === 0) continue;
      const last = stack[stack.length - 1];
      if ((char === "}" && last === "{") || (char === "]" && last === "[")) {
        stack.pop();
        if (stack.length === 0 && start !== -1) {
          return text.substring(start, i + 1);
        }
      }
    }
  }
  return null;
}

export async function generateQuizzes({
  transcript,
  instructions,
  language,
  quizType,
  cardQuantity,
}: GenerateQuizzesParams): Promise<QuizGenerationResult> {
  let prompt = "";
  if (quizType === "mc") {
    prompt = `Generate ${cardQuantity} multiple choice quiz questions in ${language} based on the following transcript. Each question must be represented as a JSON object with properties "id", "question", "options" (an array of 4 options), and "correctAnswer". Return ONLY a JSON array without any additional text.
Transcript: ${transcript}
Instructions: ${instructions}`;
  } else if (quizType === "sa") {
    prompt = `Generate ${cardQuantity} written response quiz questions in ${language} based on the following transcript. Each question must be represented as a JSON object with properties "id", "question", and "answer". The answer should be detailed and insightful. Return ONLY a JSON array without any additional text.
Transcript: ${transcript}
Instructions: ${instructions}`;
  } else if (quizType === "both") {
    prompt = `Generate 25 multiple choice quiz questions and 25 written response quiz questions in ${language} based on the following transcript.
For multiple choice, each question must be represented as a JSON object with properties "id", "question", "options" (an array of 4 options), and "correctAnswer".
For written response, each question must be represented as a JSON object with properties "id", "question", and "answer". The answer should be detailed and insightful.
Return ONLY a JSON object with two properties: "multipleChoice" and "writtenResponse", each containing the corresponding array of questions without any additional text.
Transcript: ${transcript}
Instructions: ${instructions}`;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a quiz generator." },
      { role: "user", content: prompt },
    ],
    max_tokens: 5000,
  });

  const responseText = completion.choices?.[0]?.message?.content || "";

  // Check for empty response
  if (!responseText || responseText.trim() === "") {
    throw new Error("Empty response from GPT.");
  }

  try {
    if (quizType === "both") {
      return JSON.parse(responseText) as QuizGenerationResult;
    } else {
      const questions = JSON.parse(responseText);
      if (quizType === "mc") {
        return { multipleChoice: questions as QuizMCQuestion[] };
      } else {
        return { writtenResponse: questions as QuizSAQuestion[] };
      }
    }
  } catch (initialError) {
    console.error("Initial JSON parse error:", initialError);
    // Attempt to extract balanced JSON from the response text
    const extracted = extractBalancedJson(responseText);
    if (extracted) {
      try {
        if (quizType === "both") {
          return JSON.parse(extracted) as QuizGenerationResult;
        } else {
          const questions = JSON.parse(extracted);
          if (quizType === "mc") {
            return { multipleChoice: questions as QuizMCQuestion[] };
          } else {
            return { writtenResponse: questions as QuizSAQuestion[] };
          }
        }
      } catch (extractionError) {
        console.error("Quiz JSON extraction error:", extractionError);
        throw new Error("Failed to parse quizzes from response after extraction.");
      }
    }
    throw new Error("Failed to parse quizzes from response.");
  }
}
