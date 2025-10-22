import { GoogleGenAI, ApiError } from "@google/genai";
import { SUMMARY_SYSTEM_PROMPT } from "../utils/system.prompt";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string
})


export const getSummaryFromGemini = async (pdfContent: string, prompt?: string, useSystemPrompt = true) => {
    try {
        const response = await ai.models.generateContent({
            model: process.env.MODEL as string || 'gemini-2.0-flash',

            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: prompt ?? `Transform this document into an engaging, easy to read summary with contextual relevant emojis and proper markdown formatting:\n\n${pdfContent} `
                        }
                    ]
                }
            ],
            config: {
                ...(useSystemPrompt && { systemInstruction: SUMMARY_SYSTEM_PROMPT }),
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        })
        return {
            success: true,
            message: "Summary generated",
            status: 200,
            summary: response.text
        }

    } catch (error: any) {
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