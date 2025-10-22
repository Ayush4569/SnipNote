import { GoogleGenAI, ApiError } from "@google/genai";
import { SUMMARY_SYSTEM_PROMPT } from "../utils/system.prompt";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY as string
})


export const getSummaryFromGemini = async (pdfContent: string) => {
    if (!pdfContent || pdfContent.trim() === '') {
        return {
            success: false,
            message: "Empty pdf",
            summary: null
        }
    }
    try {
        const response = await ai.models.generateContent({
            model: process.env.MODEL as string || 'gemini-2.0-flash',

            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `Transform this document into an engaging, easy to read summary with contextual relevant emojis and proper markdown formatting:\n\n${pdfContent} `
                        }
                    ]
                }
            ],
            config: {
                systemInstruction: SUMMARY_SYSTEM_PROMPT,
                temperature: 0.7,
                maxOutputTokens: 1500
            }
        })
        return {
            success: true,
            message: "Summary generated",
            summary: response.text
        }

    } catch (error: any) {
        console.log('error using gemini', error);
        return {
            success: false,
            message: error.status === 429 ? "Exceeded rate limit" : error.message || "Error generating summary",
            summary: null
        }
    }
}