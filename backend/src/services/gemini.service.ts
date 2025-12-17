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
                            - Keep each slide focused (3–6 bullet points per slide).
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

        console.log('Gemini API Response :', response);
        const parsedSlides = JSON.parse(response.text as string)

        const slidesWithIdx = parsedSlides.map((s:any, i:number) => ({
        idx: i,
        heading: s.heading,
        points: s.points,
        }))

        return {
            success: true,
            message: "Summary generated",
            status: 200,
            summary: slidesWithIdx ,
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