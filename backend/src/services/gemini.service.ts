import { GoogleGenAI, ApiError } from "@google/genai";

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
                            text: `Transform this document into an engaging, easy to read summary with contextual relevant emojis and proper markdown formatting:\n\n${pdfContent} `
                        }
                    ]
                }
            ],
            config: {
                temperature: 0.7,
                maxOutputTokens: 1500
            }
        })

        console.log('Gemini API Response :', response);
        
        
        return {
            success: true,
            message: "Summary generated",
            status: 200,
            summary: response.text,
            tokensUsed : response.usageMetadata?.totalTokenCount || 0
        }

    } catch (error:any| ApiError) {
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