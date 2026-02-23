

export const retryPrompt = (safePdfContent: string): string => {
  return `
You are an expert technical summarizer.

The previous response failed due to INVALID JSON formatting.

IMPORTANT:
- Output ONLY valid JSON
- No markdown
- No explanations
- No trailing text
- Use simple ASCII quotes only

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
