import { GoogleGenerativeAI } from "@google/generative-ai";
import { SummaryType } from "../schemas/summary";
import { CustomError } from "../utils/apiError";
import { extractJsonArray, safeParseJsonArray, validateSlides } from "../utils/pdf.tools";
import { retryPrompt } from "../utils/system.prompt";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class ChunkSummarizer {
  private ai: GoogleGenerativeAI;
  private primaryModel: string;
  private fallbackModel: string;

  constructor(apiKey: string) {
    this.ai = new GoogleGenerativeAI(apiKey);
    this.primaryModel = "gemini-2.5-flash";
    this.fallbackModel = "gemini-2.5-flash-lite";
  }

  private isRetryableError(error: any): boolean {
    const status = error?.status || error?.error?.status || error?.error?.code;
    return (
      status === 429 ||
      status === "RESOURCE_EXHAUSTED" ||
      status === 503 ||
      status === "UNAVAILABLE"
    );
  }

  private handleAIError(error: any, operation: string) {
    console.error(`${operation} error:`, error);
    const status = error?.status || error?.error?.status || error?.error?.code;

    if (status === 429 || status === "RESOURCE_EXHAUSTED") {
      throw new CustomError(
        429,
        "Rate limit exceeded. Gemini is currently busy, please try again in a moment.",
      );
    }
    if (status === 503 || status === "UNAVAILABLE") {
      throw new CustomError(
        503,
        "Gemini AI is temporarily overloaded. Please try again shortly.",
      );
    }

    throw new CustomError(500, `${operation} failed. Please try again.`);
  }

  public async contructChunkSummary(
    chunk: string,
  ): Promise<{ rawText: string; tokensUsed: number }> {
    let currentModel = this.primaryModel;

    try {
      return await this.executeChunkSummary(chunk, currentModel);
    } catch (error: any) {
      if (this.isRetryableError(error)) {
        console.warn(
          `Primary model ${currentModel} failed, retrying with ${this.fallbackModel}...`,
        );
        await sleep(1000);
        try {
          return await this.executeChunkSummary(chunk, this.fallbackModel);
        } catch (fallbackError: any) {
          this.handleAIError(fallbackError, "Micro summarization (fallback)");
        }
      }
      this.handleAIError(error, "Micro summarization");
      throw error;
    }
  }

  private async executeChunkSummary(
    chunk: string,
    modelName: string,
  ): Promise<{ rawText: string; tokensUsed: number }> {
    const model = this.ai.getGenerativeModel({ model: modelName });
    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
      You are a technical content compressor.
      Convert the following content into dense technical notes.
      RULES:
      - Do NOT generate slides or JSON.
      - No markdown, no explanations.
      - Concise lines (max 20 words).
      - Maximum 20 lines of extremely dense technical information.
      CONTENT:
      ${chunk}
      `,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1200,
      },
    });

    const result = await response.response;
    const rawText = result.text().trim();
    const tokensUsed = result.usageMetadata?.totalTokenCount || 0;

    return { rawText, tokensUsed };
  }

  public async generateSlides(
    notes: string,
    targetSlides: number,
  ): Promise<{ slides: SummaryType[]; tokensUsed: number }> {
    let currentModel = this.primaryModel;

    try {
      return await this.executeGenerateSlides(
        notes,
        targetSlides,
        currentModel,
      );
    } catch (error: any) {
      if (this.isRetryableError(error)) {
        console.warn(
          `Primary model ${currentModel} failed, retrying with ${this.fallbackModel}...`,
        );
        await sleep(1000);
        try {
          return await this.executeGenerateSlides(
            notes,
            targetSlides,
            this.fallbackModel,
          );
        } catch (fallbackError: any) {
          this.handleAIError(fallbackError, "Slide generation (fallback)");
        }
      }
      if (error instanceof SyntaxError) {
        throw new CustomError(
          422,
          "AI generated an invalid response format. Please try again.",
        );
      }
      this.handleAIError(error, "Slide generation");
      throw error;
    }
  }

  private async executeGenerateSlides(
    notes: string,
    targetSlides: number,
    modelName: string,
  ): Promise<{ slides: SummaryType[]; tokensUsed: number }> {
    const model = this.ai.getGenerativeModel({ model: modelName });
    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
    You are an expert technical presentation designer.
    Generate EXACTLY ${targetSlides} slides as valid JSON array.
    STRICT RULES:
    - Output ONLY valid JSON array.
    - No markdown, no backticks, no explanations.
    - Format: [{"heading": "string", "points": ["string", "string"]}]
    - Use relevant emojis sparingly.
    - Each slide MUST contain exactly 8 comprehensive bullet points.
    - Be very detailed to ensure 8 points are generated for each slide.
    NOTES:
    ${notes}
    `,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4000,
      },
    });

    const result = await response.response;
    let rawText = result.text().trim();

    if (rawText.startsWith("```json"))
      rawText = rawText.replace(/```json|```/g, "").trim();
    else if (rawText.startsWith("```"))
      rawText = rawText.replace(/```/g, "").trim();

    const tokensUsed = result.usageMetadata?.totalTokenCount || 0;
    const slides = JSON.parse(rawText);

    if (!Array.isArray(slides))
      throw new Error("AI failed to return a JSON array.");

    return { slides, tokensUsed };
  }
}

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";

export const summarizeTextWithGemini = async (
    pdfContent: string,
    targetSlides: number
): Promise<{
    success: boolean;
    status: number;
    message: string;
    summary: SummaryType[] | null;
    tokensUsed?: number;
}> => {
    let totalTokens = 0;

    try {
        return await executeSummarization(pdfContent, PRIMARY_MODEL, targetSlides);
    } catch (error: any) {
        const status = error?.status || error?.error?.status || error?.error?.code;
        const isRetryable = status === 429 || status === 'RESOURCE_EXHAUSTED' || status === 503 || status === 'UNAVAILABLE';

        if (isRetryable) {
            console.warn(`Primary model ${PRIMARY_MODEL} failed, retrying with ${FALLBACK_MODEL}...`);
            await sleep(1000);
            try {
                return await executeSummarization(pdfContent, FALLBACK_MODEL, targetSlides);
            } catch (fallbackError: any) {
                return formatError(fallbackError, totalTokens);
            }
        }
        return formatError(error, totalTokens);
    }
};

async function executeSummarization(pdfContent: string, modelName: string, targetSlides: number) {
    let localTokens = 0;
    const model = ai.getGenerativeModel({ model: modelName });
    const response = await model.generateContent({
        contents: [{
            role: "user",
            parts: [{
                text: `
        You are an expert technical summarizer.
        Convert the following document into a structured summary strictly in JSON format.
        Generate EXACTLY ${targetSlides} slides.
        RULES:
        - Output ONLY valid JSON array.
        - No markdown, no backticks.
        - Format: [{"heading": "Title", "points": ["p1", "p2"]}]
        - Each slide MUST contain exactly 8 comprehensive, highly detailed bullet points.
        - CRITICAL: You must summarize the entire document chronologically from beginning, through the middle, to the end. Ensure you distribute the slides/points evenly across all parts of the document so that no sections (especially the middle pages) are skipped or rushed.
        DOCUMENT:
        ${pdfContent}
        `}]
        }],
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096
        }
    });

    const result = await response.response;
    localTokens += result.usageMetadata?.totalTokenCount || 0;
    let rawText = result.text().trim();

    if (rawText.startsWith('```json')) rawText = rawText.replace(/```json|```/g, '').trim();
    else if (rawText.startsWith('```')) rawText = rawText.replace(/```/g, '').trim();

    const extractedJson = extractJsonArray(rawText);
    let slides = extractedJson ? safeParseJsonArray(extractedJson) : null;

    if (!slides || !validateSlides(slides)) {
        const retryResponse = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: retryPrompt(pdfContent, targetSlides) }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
        });
        
        const retryResult = await retryResponse.response;
        localTokens += retryResult.usageMetadata?.totalTokenCount || 0;
        let retryRaw = retryResult.text().trim();

        if (retryRaw.startsWith('```json')) retryRaw = retryRaw.replace(/```json|```/g, '').trim();
        else if (retryRaw.startsWith('```')) retryRaw = retryRaw.replace(/```/g, '').trim();

        const retryExtracted = extractJsonArray(retryRaw);
        slides = retryExtracted ? safeParseJsonArray(retryExtracted) : null;

        if (!slides || !validateSlides(slides)) {
            return {
                success: false,
                status: 422,
                message: "The AI generated an invalid response format. Please try again.",
                summary: null,
                tokensUsed: localTokens
            };
        }
    }

    return {
        success: true,
        status: 200,
        message: "Summary generated",
        summary: slides as SummaryType[],
        tokensUsed: localTokens
    };
}

function formatError(error: any, totalTokens: number) {
    console.error("Gemini API Error:", error);
    const status = error?.status || error?.error?.status || 500;
    
    let message = "Error generating summary";
    if (status === 429 || status === 'RESOURCE_EXHAUSTED') {
        message = "Rate limit exceeded. Gemini is currently busy, please try again in a moment.";
    } else if (status === 503 || status === 'UNAVAILABLE') {
        message = "AI service is currently overloaded. Please try again.";
    }
    
    return {
        success: false,
        status: typeof status === 'number' ? status : 500,
        message,
        summary: null,
        tokensUsed: totalTokens
    };
}
