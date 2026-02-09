import { GoogleGenAI, ApiError } from "@google/genai";
import { extractJsonArray, safeParseJsonArray, validateSlides } from "../utils/pdf.tools";
import { SummaryType } from "../schemas/summary";
import { retryPrompt } from "../utils/system.prompt";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string
})

export const getSummaryFromGemini = async (pdfContent: string) => {
    try {
        const response = await ai.models.generateContent({
            model: process.env.MODEL as string || 'gemini-2.5-flash-lite',

            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `You are an expert technical summarizer.
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
                             - Ensure each slide has minimum 8 points.
                            - Do NOT nest objects.

                            JSON FORMAT:
                            [
                              {
                                "heading": "Slide title here",
                                "points": ["point 1", "point 2"]
                              }
                            ]
                            
                           
                            DOCUMENT:
                            ${pdfContent}`

                        }
                    ]
                }
            ],
            config: {
                temperature: 0.7,
                maxOutputTokens: 1500
            }
        })

        const rawText = response.text as string;
        const extractJsonContent = extractJsonArray(rawText);
        let slides = extractJsonContent ? safeParseJsonArray(extractJsonContent) : null;
        let totalTokens = response.usageMetadata?.totalTokenCount || 0;
        if (!slides || !validateSlides(slides)) {
            const retry = await ai.models.generateContent({
                model: process.env.MODEL!,
                contents: [{ role: "user", parts: [{ text: retryPrompt(pdfContent) }] }],
                config: { temperature: 0.2, maxOutputTokens: 1200 }
            })

            const retryExtracted = extractJsonArray(retry.text as string);
            slides = retryExtracted ? safeParseJsonArray(retryExtracted) : null;
            if (!Array.isArray(slides)) slides = null;
            if (!slides || !validateSlides(slides)) {
                return {
                    success: false,
                    status: 422,
                    message: "AI returned malformed summary JSON",
                    summary: null
                };
            }
            totalTokens += retry.usageMetadata?.totalTokenCount || 0;
        }

        const slidesWithIdx = slides.map((s: any, i: number) => ({
            idx: i,
            heading: s.heading,
            points: s.points,
        }))

        return {
            success: true,
            message: "Summary generated",
            status: 200,
            summary: slidesWithIdx as SummaryType[],
            tokensUsed: response.usageMetadata?.totalTokenCount || 0
        }

    } catch (error: any | ApiError) {
        console.log('Gemini API Error :', error);
        return {
            success: false,
            status: error.status === 429 ? 429 : error.status === 400 ? 400 : 500,
            message: error.status === 429
                ? "Rate limit exceeded. Please try again later."
                : error.message || "Error generating summary",
            summary: null
        }
    }
}