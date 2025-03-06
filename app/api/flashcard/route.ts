import { NextResponse } from "next/server";
import { OpenAI } from "openai";

interface FlashcardType {
    openai?: OpenAI;
    youtubeTranscript?: string;
    instructions?: string;
    cardQuantity?: number;
    language?: string;
}

async function flashcard({ openai, youtubeTranscript, instructions, language, cardQuantity} : FlashcardType) : Promise<string> {
        
    const finalPrompt = `Generate ${cardQuantity} flashcards with following the instructions: ${instructions}
    regarding:\n\n ${youtubeTranscript}\n\n. Please respond only in ${language}`
    
    try {
        if (!openai) {
          throw new Error("OpenAI instance is missing. Cannot generate flashcards.");
        }
    
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini", 
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that can generate flashcards with paid question and answers in any given language."
            },
            { role: "user", content: finalPrompt },
          ],
          max_tokens: 5000,
        });
        console.log(completion.choices[0].message)
        return completion.choices[0].message?.content || "";
        } catch (error) {
            console.error("OpenAI API error in generating flashcards:", error);
            return "Error generating flashcards.";
        }
    }

export async function POST(req:Request) {
    const {youtubeTranscript, instructions, language, cardQuantity} : FlashcardType = await req.json()

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 });
      }
      if (!youtubeTranscript || !instructions || !language || !cardQuantity ) {
        return NextResponse.json(
          { error: "Failed to provide necessary details to create prompt." },
          { status: 400 }
        );
      }

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const generateFlashcards = await flashcard({openai, youtubeTranscript, instructions, language, cardQuantity})
      return NextResponse.json({
        generateFlashcards
      })
    }
        