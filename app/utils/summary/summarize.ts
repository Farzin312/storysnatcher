import { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

async function summarizeChunk(chunk: string, promptPrefix: string): Promise<string> {
  const prompt = `${promptPrefix}\n\n${chunk}`;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a summarization assistant." },
      { role: "user", content: prompt }
    ],
    max_tokens: 500,
  });
  return completion?.choices?.[0]?.message?.content?.trim() || "";
}

export async function generateSummary(
  transcript: string,
  language: string,
  summaryType: string,
  customPrompt?: string
): Promise<string> {
  const chunkSize = 3500;
  const chunks = splitIntoChunks(transcript, chunkSize);
  
  let promptPrefix = "Summarize the following transcript:";

  // Adjust the prompt prefix for each chunk based on summary type.
  switch (summaryType) {
    case "concise":
      promptPrefix = "Provide a concise summary of the following transcript:";
      break;
    case "detailed":
      promptPrefix = "Provide a detailed summary of the following transcript:";
      break;
    case "bullet points":
      promptPrefix = "Summarize the following transcript as bullet points:";
      break;
    case "custom":
      promptPrefix = customPrompt && customPrompt.trim() !== "" ? customPrompt : promptPrefix;
      break;
    default:
      break;
  }
  
  const chunkSummaries = await Promise.all(
    chunks.map((chunk) => summarizeChunk(chunk, promptPrefix))
  );
  const combinedSummary = chunkSummaries.join("\n");

  // Create a final prompt that explicitly instructs the assistant to use the requested language.
  let finalPrompt = "";
  switch (summaryType) {
    case "concise":
      finalPrompt = `Provide a concise final summary. Ensure the summary is entirely in ${language}.\n\n${combinedSummary}`;
      break;
    case "detailed":
      finalPrompt = `Provide a detailed final summary. Ensure the entire summary is written exclusively in ${language} and does not include any text in another language.\n\n${combinedSummary}`;
      break;
      case "bullet points":
        finalPrompt = `Provide a final summary formatted as bullet points. Each bullet point must be written exclusively in ${language}. Do not include any introductory or concluding text—only the bullet points. Ensure that the entire response is in ${language}.\n\n${combinedSummary}`;
        break;
      
    case "custom":
      finalPrompt = customPrompt && customPrompt.trim() !== ""
        ? `${customPrompt}\n\nPlease ensure the final summary is entirely in ${language}.\n\n${combinedSummary}`
        : `Provide a final summary. Ensure the summary is entirely in ${language}.\n\n${combinedSummary}`;
      break;
    default:
      finalPrompt = `Provide a concise final summary. Ensure the summary is entirely in ${language}.\n\n${combinedSummary}`;
  }
  
  const finalCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a summarization assistant." },
      { role: "user", content: finalPrompt }
    ],
    max_tokens: 1500,
  });
  
  return finalCompletion?.choices?.[0]?.message?.content?.trim() || "";
}
