"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummaryFromGemini = void 0;
const genai_1 = require("@google/genai");
const system_prompt_1 = require("../utils/system.prompt");
const ai = new genai_1.GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});
const getSummaryFromGemini = async (pdfContent, prompt, useSystemPrompt = true) => {
    try {
        const response = await ai.models.generateContent({
            model: process.env.MODEL || 'gemini-2.0-flash',
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
                ...(useSystemPrompt && { systemInstruction: system_prompt_1.SUMMARY_SYSTEM_PROMPT }),
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        });
        return {
            success: true,
            message: "Summary generated",
            status: 200,
            summary: response.text,
            tokensUsed: response.usageMetadata?.totalTokenCount || 0
        };
    }
    catch (error) {
        console.log('Gemini API Error :', error);
        return {
            success: false,
            status: error.status === 429 ? 429 : error.status === 400 ? 400 : 500,
            message: error.status === 429
                ? "Rate limit exceeded. Please try again later."
                : error.message || "Error generating summary",
            summary: null
        };
    }
};
exports.getSummaryFromGemini = getSummaryFromGemini;
