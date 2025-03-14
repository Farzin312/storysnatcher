import { OpenAI } from "openai";
import { CardType } from "@/app/components/reusable/Cards";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface GenerateFlashcardsParams {
  transcript: string;
  instructions: string;
  language: string;
  cardQuantity: number;
}

export async function generateFlashcards({
  transcript,
  instructions,
  language,
  cardQuantity,
}: GenerateFlashcardsParams): Promise<CardType[]> {
  // We instruct the model to output flashcards in the selected language,
  // regardless of the transcript’s original language.
  const prompt = `Generate ${cardQuantity} flashcards in ${language} based on the following transcript. Even if the transcript is in another language, ensure that both the questions and answers are written exclusively in ${language}. Each flashcard must be represented as a JSON object with "question" and "answer" properties. The response must be a valid JSON array containing exactly ${cardQuantity} objects.
  
Transcript: ${transcript}
Instructions: ${instructions}

Return ONLY the JSON array without any additional text.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a flashcard generator." },
      { role: "user", content: prompt },
    ],
    max_tokens: 1500,
  });

  const responseText = completion.choices?.[0]?.message?.content || "";

  try {
    // Attempt to parse the response directly as JSON.
    return JSON.parse(responseText) as CardType[];
  } catch {
    // Fallback: use a regex to extract the JSON array.
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as CardType[];
      } catch (err) {
        console.error("JSON extraction error:", err);
        throw new Error("Failed to parse flashcards from response after extraction.");
      }
    } else {
      throw new Error("Failed to parse flashcards from response.");
    }
  }
}
