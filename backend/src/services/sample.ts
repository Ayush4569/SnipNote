import { GoogleGenAI, ApiError } from "@google/genai";
import { extractJsonArray, safeParseJsonArray, validateSlides } from "../utils/pdf.tools";
import { SummaryType } from "../schemas/summary";
import { retryPrompt } from "../utils/system.prompt";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string
});

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export const summarizeTextWithGemini = async (
    pdfContent: string
): Promise<{
    success: boolean;
    status: number;
    message: string;
    summary: SummaryType[] | null;
    tokensUsed?: number;
}> => {
    let totalTokens = 0;

    try {
        let response;

        try {
            response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `
            You are an expert technical summarizer.
            Convert the following document into a structured summary strictly in JSON format.

            RULES (VERY IMPORTANT):
            - Output ONLY valid JSON.
            - Do NOT include markdown.
            - Do NOT include explanations or extra text.
            - Do NOT wrap the JSON in backticks.
            - Each slide must contain:
                - "heading": a short, clear title (string, no # symbols)
                - "points": an array of concise bullet points (strings)
            - Use relevant emojis inside headings or points where appropriate.
            - Each slide should contain 4–6 bullet points.
            - Do NOT nest objects.
            - Do not truncate.
            - Ensure the JSON array is properly closed.
            - If output exceeds limit, reduce content but return complete JSON.

            JSON FORMAT:
            [
              {
                "heading": "Slide title here",
                "points": ["point 1", "point 2"]
              }
            ]

            DOCUMENT:
            ${pdfContent}
                                `
                            }
                        ]
                    }
                ],
                config: {
                    temperature: 0.2,
                    maxOutputTokens: 4096
                }
            });
        } catch (err: any) {
            if (err?.status === 503) {
                await sleep(1500);
                response = await ai.models.generateContent({
                    model: process.env.MODEL || "gemini-2.5-flash-lite",
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: retryPrompt(pdfContent) }]
                        }
                    ],
                    config: {
                        temperature: 0.2,
                        maxOutputTokens: 4096
                    }
                });
            } else {
                throw err;
            }
        }

        totalTokens += response.usageMetadata?.totalTokenCount || 0;


        const parts = response.candidates?.[0]?.content?.parts || [];
        console.log('parts', parts);

        const rawText = parts
            .filter(part => part.text)
            .map(part => part.text)
            .join("");

        console.log('rawText', rawText);

        if (!rawText.includes("[")) {
            return {
                success: false,
                status: 422,
                message: "AI did not return JSON structure",
                summary: null,
                tokensUsed: totalTokens
            };
        }

        const extractedJson = extractJsonArray(rawText);
        let slides = extractedJson ? safeParseJsonArray(extractedJson) : null;

        if (!slides || !validateSlides(slides)) {
            const retry = await ai.models.generateContent({
                model: process.env.MODEL || "gemini-2.5-flash-lite",
                contents: [
                    {
                        role: "user",
                        parts: [{ text: retryPrompt(pdfContent) }]
                    }
                ],
                config: {
                    temperature: 0.2,
                    maxOutputTokens: 4096
                }
            });

            totalTokens += retry.usageMetadata?.totalTokenCount || 0;

            const retryParts = retry.candidates?.[0]?.content?.parts || [];
            console.log("retryParts", retryParts);

            const retryRawText = retryParts
                .filter(part => part.text)
                .map(part => part.text)
                .join("");
            console.log('retryRawText', retryRawText);

            const retryExtracted = extractJsonArray(retryRawText);
            slides = retryExtracted ? safeParseJsonArray(retryExtracted) : null;

            if (!slides || !validateSlides(slides)) {
                return {
                    success: false,
                    status: 422,
                    message: "AI returned malformed summary JSON",
                    summary: null,
                    tokensUsed: totalTokens
                };
            }
        }
        return {
            success: true,
            status: 200,
            message: "Summary generated",
            summary: slides as SummaryType[],
            tokensUsed: totalTokens
        };

    } catch (error: any | ApiError) {
        console.error("Gemini API Error:", error);

        return {
            success: false,
            status:
                error?.status === 429
                    ? 429
                    : error?.status === 503
                        ? 503
                        : error?.status === 400
                            ? 400
                            : 500,
            message:
                error?.status === 429
                    ? "Rate limit exceeded. Please try again later."
                    : error?.status === 503
                        ? "Model temporarily unavailable. Please try again."
                        : error?.message || "Error generating summary",
            summary: null,
            tokensUsed: totalTokens
        };
    }
};
