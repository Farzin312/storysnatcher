import { OpenAI } from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable.");
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Splits the input text into chunks of a specified maximum size.
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
 * Summarizes a single chunk in the target language while preserving key details.
 * The prompt instructs the model to return plain text.
 * You may optionally remove "plain text" if you want chunk summaries to be markdown formatted.
 * @param chunk A piece of the transcript.
 * @param language The target language.
 * @returns A summary for the chunk.
 */
async function summarizeChunk(chunk: string, language: string): Promise<string> {
  try {
    if (!chunk.trim()) return "";
    const prompt = `Summarize the following text in ${language} while preserving its key details and insights. 
Return your answer as plain text:\n\n${chunk}`;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an educational assistant." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
    });
    return completion?.choices?.[0]?.message?.content?.trim() || "[Summary unavailable]";
  } catch (error) {
    console.error("Chunk summarization error:", error);
    return "[Error summarizing this section]";
  }
}

/**
 * Generates a detailed and comprehensive study guide by processing the transcript in chunks.
 * The final study guide is produced in the target language as Markdown formatted text with headings and bold text.
 * @param transcript The full transcript text.
 * @param language The target language for the study guide.
 * @returns A detailed study guide.
 */
export async function generateStudyGuide(transcript: string, language: string): Promise<string> {
  try {
    if (!transcript.trim()) {
      throw new Error("Transcript cannot be empty.");
    }
    const chunkSize = 4000; // Adjust chunk size as needed
    const chunks = splitIntoChunks(transcript, chunkSize);

    // Summarize each chunk concurrently
    const chunkSummaries: string[] = await Promise.all(
      chunks.map((chunk) => summarizeChunk(chunk, language))
    );
    const combinedSummaries = chunkSummaries.join("\n\n");

    // Final prompt instructs GPT-4o-mini to generate a detailed study guide in Markdown.
    const finalPrompt = `Using the following chunk summaries as context, generate a detailed and comprehensive study guide in ${language} that highlights the key points, provides in-depth explanations, and offers insightful analysis for future quizzes and revision.
Return your answer as Markdown formatted text, using headings (e.g., "# Title") and bold text (e.g., "**Bold Title**") where appropriate.\n\n${combinedSummaries}`;

    const finalCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an educational assistant." },
        { role: "user", content: finalPrompt }
      ],
      max_tokens: 1500,
    });
    return finalCompletion?.choices?.[0]?.message?.content?.trim() || "[Study guide unavailable]";
  } catch (error) {
    console.error("Study guide generation error:", error);
    throw new Error("Failed to generate study guide");
  }
}
