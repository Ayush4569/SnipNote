

export const retryPrompt = (safePdfContent: string, targetSlides: number): string => {
  return `
You are an expert technical summarizer.

The previous response failed due to INVALID JSON formatting.

IMPORTANT:
- Output ONLY valid JSON
- Generate EXACTLY ${targetSlides} slides.
- No markdown
- No explanations
- No trailing text
- Use simple ASCII quotes only
- Each slide MUST contain exactly 8 comprehensive, highly detailed bullet points.
- CRITICAL: Cover the entire document chronologically from beginning, through the middle, to the end. Do not skip middle pages.

JSON FORMAT:
[
  {
    "heading": "string",
    "points": ["string"]
  }
]

DOCUMENT:
${safePdfContent}
`;
}
