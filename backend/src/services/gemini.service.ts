import { GoogleGenAI, Type } from "@google/genai";
import { SummaryType } from "../schemas/summary";
import { CustomError } from "../utils/apiError";
import { extractJsonArray, safeParseJsonArray, normalizeSlides, validateSlides } from "../utils/pdf.tools";
import { retryPrompt } from "../utils/system.prompt";

export const getPrimaryModel = (): string =>
  process.env.PRIMARY_MODEL || "gemini-3.6-flash";

export const getFallbackModel = (): string =>
  process.env.FALLBACK_MODEL  || "gemini-3.5-flash-lite";

const slidesSchema = {
  type: Type.ARRAY,
  description: "Presentation summary slides array",
  items: {
    type: Type.OBJECT,
    properties: {
      heading: {
        type: Type.STRING,
        description: "Clear and descriptive slide heading",
      },
      points: {
        type: Type.ARRAY,
        description: "Array of exactly 8 detailed bullet points",
        items: {
          type: Type.STRING,
        },
      },
    },
    required: ["heading", "points"],
  },
};

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const calculateBackoff = (attempt: number, baseMs = 1000, maxMs = 7000): number => {
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(maxMs, baseMs * Math.pow(2, attempt)) + jitter;
};

export class ChunkSummarizer {
  private ai: GoogleGenAI;
  private primaryModel: string;
  private fallbackModel: string;

  constructor(apiKey?: string, primaryModel?: string, fallbackModel?: string) {
    this.ai = new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY });
    this.primaryModel = primaryModel || getPrimaryModel();
    this.fallbackModel = fallbackModel || getFallbackModel();
  }

  private isRetryableError(error: any): boolean {
    const status = error?.status || error?.error?.status || error?.error?.code;
    const message = (error?.message || "").toLowerCase();

    // Rate limits and server-side transient errors
    if (
      status === 429 ||
      status === "RESOURCE_EXHAUSTED" ||
      status === 503 ||
      status === "UNAVAILABLE" ||
      status === 500 ||
      status === 502 ||
      status === 504 ||
      status === "INTERNAL" ||
      status === "GATEWAY_TIMEOUT"
    ) {
      return true;
    }

    // Network and connection errors
    const networkCodes = ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "ECONNREFUSED", "UND_ERR_SOCKET"];
    if (networkCodes.includes(error?.code)) {
      return true;
    }

    if (
      message.includes("fetch failed") ||
      message.includes("network error") ||
      message.includes("overloaded") ||
      message.includes("rate limit") ||
      message.includes("quota") ||
      message.includes("timeout")
    ) {
      return true;
    }

    return false;
  }

  private handleAIError(error: any, operation: string): never {
    console.error(`[Gemini Service] ${operation} error:`, error);
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

    throw new CustomError(500, `${operation} failed: ${error?.message || "Please try again."}`);
  }

  public async contructChunkSummary(
    chunk: string,
  ): Promise<{ rawText: string; tokensUsed: number }> {
    const maxRetries = 2;

    // 1. Try with Primary Model
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeChunkSummary(chunk, this.primaryModel);
        return result;
      } catch (error: any) {
        if (!this.isRetryableError(error) || attempt === maxRetries) {
          console.warn(`[ChunkSummarizer] Primary model failed on attempt ${attempt + 1}, evaluating fallback...`, error?.message);
          break;
        }
        const backoff = calculateBackoff(attempt);
        console.warn(`[ChunkSummarizer] Primary model retryable error (${error?.status || error?.code}), retrying in ${backoff}ms...`);
        await sleep(backoff);
      }
    }

    // 2. Try with Fallback Model
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.warn(`[ChunkSummarizer] Attempting chunk summarization with fallback model ${this.fallbackModel} (attempt ${attempt + 1})...`);
        const result = await this.executeChunkSummary(chunk, this.fallbackModel);
        return result;
      } catch (fallbackError: any) {
        if (!this.isRetryableError(fallbackError) || attempt === maxRetries) {
          // If all AI attempts fail for this chunk, gracefully extract key lines rather than failing entire multi-chunk PDF
          console.error(`[ChunkSummarizer] All models failed for chunk, generating local safe excerpt fallback:`, fallbackError?.message);
          const lines = chunk
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.length > 20)
            .slice(0, 15);
          return {
            rawText: lines.join("\n") || chunk.slice(0, 600),
            tokensUsed: 0,
          };
        }
        const backoff = calculateBackoff(attempt);
        await sleep(backoff);
      }
    }

    return { rawText: chunk.slice(0, 600), tokensUsed: 0 };
  }

  private async executeChunkSummary(
    chunk: string,
    modelName: string,
  ): Promise<{ rawText: string; tokensUsed: number }> {
    const promptText = `
      You are a technical content compressor.
      Convert the following content into dense technical notes.
      RULES:
      - Do NOT generate slides or JSON.
      - No markdown, no explanations.
      - Concise lines (max 20 words).
      - Maximum 20 lines of extremely dense technical information.
      CONTENT:
      ${chunk}
      `;

    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        temperature: 0.2,
        maxOutputTokens: 1200,
      },
    });

    const rawText = (response.text || "").trim();
    const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

    return { rawText, tokensUsed };
  }

  public async generateSlides(
    notes: string,
    targetSlides: number,
  ): Promise<{ slides: SummaryType[]; tokensUsed: number }> {
    const maxRetries = 2;

    // 1. Attempt with primary model
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeGenerateSlides(notes, targetSlides, this.primaryModel);
      } catch (error: any) {
        if (!this.isRetryableError(error) || attempt === maxRetries) {
          console.warn(`[ChunkSummarizer] Primary slide generation failed on attempt ${attempt + 1}, trying fallback model...`);
          break;
        }
        const backoff = calculateBackoff(attempt);
        await sleep(backoff);
      }
    }

    // 2. Attempt with fallback model
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeGenerateSlides(notes, targetSlides, this.fallbackModel);
      } catch (fallbackError: any) {
        if (!this.isRetryableError(fallbackError) || attempt === maxRetries) {
          this.handleAIError(fallbackError, "Slide generation (fallback)");
        }
        const backoff = calculateBackoff(attempt);
        await sleep(backoff);
      }
    }

    throw new CustomError(500, "Slide generation failed after retries.");
  }

  private async executeGenerateSlides(
    notes: string,
    targetSlides: number,
    modelName: string,
  ): Promise<{ slides: SummaryType[]; tokensUsed: number }> {
    let localTokens = 0;

    const promptText = `
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
    `;

    const response = await this.ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        temperature: 0.2,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: slidesSchema,
      },
    });

    localTokens += response.usageMetadata?.totalTokenCount || 0;

    let rawText = (response.text || "").trim();
    if (rawText.startsWith("```json")) rawText = rawText.replace(/```json|```/g, "").trim();
    else if (rawText.startsWith("```")) rawText = rawText.replace(/```/g, "").trim();

    const extracted = extractJsonArray(rawText);
    const parsed = extracted ? safeParseJsonArray(extracted) : null;
    let slides = parsed ? normalizeSlides(parsed) : null;

    // Retry with formatting prompt if JSON is invalid or does not pass schema validation
    if (!slides || !validateSlides(slides)) {
      console.warn("[ChunkSummarizer] Primary response failed schema validation. Retrying with retryPrompt...");
      const retryResponse = await this.ai.models.generateContent({
        model: modelName,
        contents: retryPrompt(notes, targetSlides),
        config: {
          temperature: 0.15,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: slidesSchema,
        },
      });

      localTokens += retryResponse.usageMetadata?.totalTokenCount || 0;

      let retryRaw = (retryResponse.text || "").trim();
      if (retryRaw.startsWith("```json")) retryRaw = retryRaw.replace(/```json|```/g, "").trim();
      else if (retryRaw.startsWith("```")) retryRaw = retryRaw.replace(/```/g, "").trim();

      const retryExtracted = extractJsonArray(retryRaw);
      const retryParsed = retryExtracted ? safeParseJsonArray(retryExtracted) : null;
      slides = retryParsed ? normalizeSlides(retryParsed) : null;

      if (!slides || !validateSlides(slides)) {
        throw new CustomError(422, "AI generated an invalid slide format after retry.");
      }
    }

    return { slides: slides as SummaryType[], tokensUsed: localTokens };
  }
}

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
  const primaryModel = getPrimaryModel();
  const fallbackModel = getFallbackModel();
  const maxRetries = 2;
  let totalTokens = 0;

  // 1. Primary Model attempts
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await executeSummarization(pdfContent, primaryModel, targetSlides);
      totalTokens += res.tokensUsed || 0;
      if (res.success && res.summary && res.summary.length > 0) {
        return {
          ...res,
          tokensUsed: totalTokens,
        };
      }
      console.warn(`[summarizeTextWithGemini] Primary model (${primaryModel}) attempt ${attempt} failed validation, retrying...`);
      if (attempt === maxRetries) break;
      await sleep(calculateBackoff(attempt));
    } catch (error: any) {
      totalTokens += error?.tokensUsed || 0;
      const status = error?.status || error?.error?.status || error?.error?.code;
      const isRetryable =
        status === 429 ||
        status === "RESOURCE_EXHAUSTED" ||
        status === 503 ||
        status === "UNAVAILABLE" ||
        status === 500;

      if (!isRetryable || attempt === maxRetries) {
        console.warn(`[summarizeTextWithGemini] Primary model (${primaryModel}) failed, switching to fallback ${fallbackModel}...`);
        break;
      }
      const backoff = calculateBackoff(attempt);
      await sleep(backoff);
    }
  }

  // 2. Fallback Model attempts
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await executeSummarization(pdfContent, fallbackModel, targetSlides);
      totalTokens += res.tokensUsed || 0;
      if (res.success && res.summary && res.summary.length > 0) {
        return {
          ...res,
          tokensUsed: totalTokens,
        };
      }
      console.warn(`[summarizeTextWithGemini] Fallback model (${fallbackModel}) attempt ${attempt} failed validation, retrying...`);
      if (attempt === maxRetries) {
        return {
          success: false,
          status: 422,
          message: "The AI generated an invalid response format. Please try again.",
          summary: null,
          tokensUsed: totalTokens,
        };
      }
      await sleep(calculateBackoff(attempt));
    } catch (fallbackError: any) {
      totalTokens += fallbackError?.tokensUsed || 0;
      const status = fallbackError?.status || fallbackError?.error?.status;
      const isRetryable = status === 429 || status === "RESOURCE_EXHAUSTED" || status === 503 || status === "UNAVAILABLE";

      if (!isRetryable || attempt === maxRetries) {
        return formatError(fallbackError, totalTokens);
      }
      const backoff = calculateBackoff(attempt);
      await sleep(backoff);
    }
  }

  return formatError(new Error("Summarization failed after retries"), totalTokens);
};

const defaultAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function executeSummarization(pdfContent: string, modelName: string, targetSlides: number) {
  let localTokens = 0;
  const geminiStart = performance.now();

  const promptText = `
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
        `;

  const response = await defaultAI.models.generateContent({
    model: modelName,
    contents: promptText,
    config: {
      temperature: 0.2,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: slidesSchema,
    },
  });

  const geminiTime = performance.now() - geminiStart;
  console.log(`[Gemini] ${modelName} completed in ${geminiTime.toFixed(2)}ms`);

  localTokens += response.usageMetadata?.totalTokenCount || 0;

  const candidate = response.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    console.warn(`[Gemini] Non-STOP finishReason encountered: ${candidate.finishReason}`);
  }

  let rawText = (response.text || "").trim();
  if (rawText.startsWith("```json")) rawText = rawText.replace(/```json|```/g, "").trim();
  else if (rawText.startsWith("```")) rawText = rawText.replace(/```/g, "").trim();

  const extractedJson = extractJsonArray(rawText);
  const parsed = extractedJson ? safeParseJsonArray(extractedJson) : null;
  let slides = parsed ? normalizeSlides(parsed) : null;

  if (!slides || !validateSlides(slides)) {
    console.warn("[Gemini] Response failed validation. Running retryPrompt with structured schema...");
    const retryResponse = await defaultAI.models.generateContent({
      model: modelName,
      contents: retryPrompt(pdfContent, targetSlides),
      config: {
        temperature: 0.15,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: slidesSchema,
      },
    });

    localTokens += retryResponse.usageMetadata?.totalTokenCount || 0;

    let retryRaw = (retryResponse.text || "").trim();
    if (retryRaw.startsWith("```json")) retryRaw = retryRaw.replace(/```json|```/g, "").trim();
    else if (retryRaw.startsWith("```")) retryRaw = retryRaw.replace(/```/g, "").trim();

    const retryExtracted = extractJsonArray(retryRaw);
    const retryParsed = retryExtracted ? safeParseJsonArray(retryExtracted) : null;
    slides = retryParsed ? normalizeSlides(retryParsed) : null;

    if (!slides || !validateSlides(slides)) {
      return {
        success: false,
        status: 422,
        message: "The AI generated an invalid response format. Please try again.",
        summary: null,
        tokensUsed: localTokens,
      };
    }
  }

  return {
    success: true,
    status: 200,
    message: "Summary generated",
    summary: slides as SummaryType[],
    tokensUsed: localTokens,
  };
}

function formatError(error: any, totalTokens: number) {
  console.error("[Gemini API Error]:", error);
  const status = error?.status || error?.error?.status || 500;

  let message = "Error generating summary";
  if (status === 429 || status === "RESOURCE_EXHAUSTED") {
    message = "Rate limit exceeded. Gemini is currently busy, please try again in a moment.";
  } else if (status === 503 || status === "UNAVAILABLE") {
    message = "AI service is currently overloaded. Please try again.";
  }

  return {
    success: false,
    status: typeof status === "number" ? status : 500,
    message,
    summary: null,
    tokensUsed: totalTokens,
  };
}
