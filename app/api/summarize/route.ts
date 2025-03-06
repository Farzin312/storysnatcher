import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { OpenAI } from "openai";
import { PDFDocument, StandardFonts } from "pdf-lib"; // For PDF generation

interface SummarizationRequest {
  openai?: OpenAI;
  summaries?: string[];
  summaryUrl?: string;
  transcript?: string;
  customPrompt?: string;
  summaryType?: "concise" | "detailed" | "bullet" | "custom";
  summaryLanguage?: string;
}

/**
 * 1. Fetch the transcript from YouTube.
 */
async function transcribe(summaryUrl: string): Promise<string> {
  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript(summaryUrl);
    // Join all 'text' segments into one big string
    return transcriptArray.map((t) => t.text).join(" ");
  } catch (error) {
    console.error("Error fetching YouTube transcript:", error);
    throw new Error("Failed to fetch transcript");
  }
}

/**
 * 2. Generate a summary using OpenAI (including the actual transcript in the prompt).
 */
async function generateSummary({
  openai,
  summaryType,
  summaryLanguage,
  customPrompt,
  transcript,
}: SummarizationRequest): Promise<string> {
  // Decide how to instruct the model
  let finalInstruction: string;

  switch (summaryType) {
    case "custom":
      finalInstruction = customPrompt || "Summarize the following text";
      break;
    case "detailed":
      finalInstruction = "Provide a detailed summary of the following text";
      break;
    case "bullet":
      finalInstruction = "Provide a bullet-point summary of the following text";
      break;
    default:
      // e.g. "concise" or fallback
      finalInstruction = "Provide a concise summary of the following text";
      break;
  }

  // *** If summaryLanguage is something like "French", incorporate that fully. ***
  // The key is to be explicit, e.g. "Respond in French only."
  const finalPrompt = `${finalInstruction}:\n\n${transcript}\n\n
Please respond **only in ${summaryLanguage}**.`;

  try {
    if (!openai) {
      throw new Error("OpenAI instance is missing. Cannot generate summary.");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-4" if you have access
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that can summarize text in any given language."
        },
        { role: "user", content: finalPrompt },
      ],
      max_tokens: 5000,
    });

    return completion.choices[0].message?.content || "";
  } catch (error) {
    console.error("OpenAI API error in final summary:", error);
    return "Error generating final summary.";
  }
}

/**
 * 3. GET request: Return a PDF of the transcript for download.
 */
export async function GET(req: Request) {
  try {
    // e.g. /api/summarize?url=https://youtube.com/watch?v=...
    const { searchParams } = new URL(req.url);
    const summaryUrl = searchParams.get("url");

    if (!summaryUrl) {
      return NextResponse.json(
        { error: "URL parameter is required to fetch the transcript" },
        { status: 400 }
      );
    }

    // 1. Fetch the transcript
    const fullTranscript = await transcribe(summaryUrl);

    // 2. Generate PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    // Basic text settings
    const { width, height } = page.getSize();
    const fontSize = 12;
    const margin = 50;

    // Embed a font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // For multi-line text wrapping, you'd iterate line by line or use a library
    page.drawText(fullTranscript, {
      x: margin,
      y: height - margin - fontSize,
      size: fontSize,
      font,
      lineHeight: 14,
      maxWidth: width - margin * 2,
    });

    const pdfBytes = await pdfDoc.save();

    // 3. Return a downloadable PDF response
    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=transcript.pdf",
      },
    });
  } catch (error: unknown) {
    console.error("Error generating PDF transcript:", error);
    return NextResponse.json({ error: "Failed to generate PDF transcript" }, { status: 500 });
  }
}

/**
 * 4. POST request: Summarize text (YouTube + OpenAI).
 */
export async function POST(req: Request) {
  try {
    const {
      summaryUrl,
      transcript,
      customPrompt,
      summaryType = "concise",
      summaryLanguage = "en",
    }: SummarizationRequest = await req.json();

    // Check for the OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is missing" }, { status: 500 });
    }

    // 1. If a YouTube URL is provided, fetch the transcript; otherwise, use the existing transcript
    const finalTranscript = summaryUrl ? await transcribe(summaryUrl) : transcript;
    if (!finalTranscript) {
      return NextResponse.json(
        { error: "No transcript available. Provide 'summaryUrl' or 'transcript'." },
        { status: 400 }
      );
    }

    // 2. Create an OpenAI client
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 3. Generate the summary, passing the transcript text
    const summary = await generateSummary({
      openai,
      summaryType,
      summaryLanguage,
      customPrompt,
      transcript: finalTranscript, // <--- important!
    });

    // 4. Return the summary (and final transcript if needed)
    return NextResponse.json({
      summary,
      transcript: finalTranscript,
    });
  } catch (error: unknown) {
    console.error("Error in POST summarize route:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
