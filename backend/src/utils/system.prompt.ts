

export const retryPrompt = (safePdfContent: string, targetSlides: number): string => {
  return `
You are an expert technical summarizer.

The previous response failed due to INVALID JSON formatting.

IMPORTANT:
- Output ONLY valid JSON array.
- Generate EXACTLY ${targetSlides} slides.
- No markdown, no backticks.
- No conversational text or explanations.
- Use simple ASCII quotes only.
- Each slide MUST contain exactly 8 comprehensive, highly detailed bullet points.
- CRITICAL: Cover the entire document chronologically from beginning, through the middle, to the end. Do not skip middle pages.

JSON FORMAT:
[
  {
    "heading": "Descriptive Slide Heading",
    "points": [
      "First key insight...",
      "Second key insight...",
      "Third key insight...",
      "Fourth key insight...",
      "Fifth key insight...",
      "Sixth key insight...",
      "Seventh key insight...",
      "Eighth key insight..."
    ]
  }
]

DOCUMENT:
${safePdfContent}
`;
};
