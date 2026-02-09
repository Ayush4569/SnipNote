import { SummaryType } from "schemas/summary";

function cleanPDFText(rawText: string): string {
  return rawText
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')
    .replace(/_{3,}|-{3,}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')

    .replace(/\u0000/g, '')                  // null bytes
    .replace(/[^\x20-\x7E\n]/g, '')          // non-ASCII junk
    .replace(/["“”]/g, "'")                  // normalize quotes
    .replace(/\s{2,}/g, ' ')                 // final whitespace pass

    // 🛑 hard safety cap
    .slice(0, 12000)
    .trim();
}
function calculateWordCount(summary: SummaryType[]): number {
  const text = summary.flatMap(s => [s.heading, ...s.points])
    .join(' ')
    .replace(/\s+/g, " ")
    .trim()
  if (!text) return 0

  return text.replace(/[\p{Emoji_Presentation}\{Extended_Pictographic}]/gu, "").split(" ").length
}
function extractJsonArray(text: string): string | null {
  if (!text) return null;

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");

  if (firstBracket === -1 || lastBracket === -1 || lastBracket <= firstBracket) {
    return null;
  }

  return text.slice(firstBracket, lastBracket + 1);
}
function safeParseJsonArray(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
function validateSlides(slides: SummaryType[]): boolean {
  return slides.every(slide =>
    typeof slide === "object" &&
    typeof slide.heading === "string" &&
    Array.isArray(slide.points) &&
    slide.points.every((p: any) => typeof p === "string")
  );
}


export {  cleanPDFText, calculateWordCount, extractJsonArray,safeParseJsonArray,validateSlides };