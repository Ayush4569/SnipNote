
import {  GoogleGenAI } from "@google/genai";
import { SummaryType } from "../schemas/summary";
import { CustomError } from "../utils/apiError";

export class ChunkSummarizer {
    private ai: GoogleGenAI
    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey });
    }

    public async contructChunkSummary(chunk:string):Promise<{rawText:string,tokensUsed:number}> {

        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: [
                  {
                    role: "user",
                    parts: [
                      {
                        text: `
        You are a technical content compressor.
        
        Convert the following content into dense technical notes.
        
        RULES:
        - Do NOT generate slides.
        - Do NOT generate JSON.
        - No markdown.
        - No explanations.
        - Avoid repetition.
        - Each line must be concise (max 20 words).
        - Maximum 10 lines total.
        - Preserve definitions, models, and key mechanisms.
        
        CONTENT:
        ${chunk}
                        `,
                      },
                    ],
                  },
                ],
                config: {
                  temperature: 0.2,
                  maxOutputTokens: 1200,
                },
              });

              const parts = response.candidates?.[0].content?.parts || []
              const rawText = parts.filter(p=>p.text).map(p=>p.text).join("").trim()
              const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

              return {rawText,tokensUsed}

        } catch (error) {
            console.error("Micro summarization error:", error);
            throw new CustomError(500, "Micro summarization failed");
        }
    }
    public async generateSlides(
        notes: string,
        targetSlides: number
      ): Promise<{ slides: SummaryType[]; tokensUsed: number }> {
        try {
          const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `
    You are an expert technical presentation designer.
    
    Using the condensed notes below, generate EXACTLY ${targetSlides} slides.
    You MUST return exactly ${targetSlides} objects.
    Do NOT exceed or reduce.
    
    STRICT RULES:
    - Output ONLY valid JSON.
    - Do NOT include markdown.
    - Do NOT include explanations.
    - Do NOT wrap JSON in backticks.
    - Return exactly ${targetSlides} slide objects.
    - Each slide must contain:
      - "heading": short, clear title (no # symbols)
      - "points": array of 4–6 concise bullet points
    - Avoid repetition across slides.
    - Distribute content evenly.
    - Preserve technical accuracy.
    - Use relevant emojis sparingly.
    
    JSON FORMAT:
    [
      {
        "heading": "Slide title",
        "points": ["Point 1", "Point 2"]
      }
    ]
    
    NOTES:
    ${notes}
                    `,
                  },
                ],
              },
            ],
            config: {
              temperature: 0.2,
              maxOutputTokens: 4000,
            },
          });
    
          const parts = response.candidates?.[0]?.content?.parts || [];
          const rawText = parts.filter((p) => p.text).map((p) => p.text).join("").trim();

    
          const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

          const slides = JSON.parse(rawText);


      if (!Array.isArray(slides) || slides.length !== targetSlides) {
        throw new Error("Slide count mismatch");
      }
    
          return { slides, tokensUsed };
        } catch (error) {
          console.error("Slide generation error:", error);
          throw new CustomError(500, "Slide generation failed");
        }
      }

}