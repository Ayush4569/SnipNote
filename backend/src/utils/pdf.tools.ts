import { SummaryType } from "schemas/summary";

function cleanPDFText(rawText: string): string {
  return rawText
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')


    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')

    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")

    .replace(/[ \t]{2,}/g, ' ')

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
    slide.points.every((p: string) => typeof p === "string")
  );
}



function structureText(rawText: string): string[] {
  let cleaned = removeRepeatedLines(rawText);
  cleaned = removePageNumbers(cleaned);
  cleaned = mergeBrokenLines(cleaned);
  return normalizeParagraphs(cleaned);
}
function removeRepeatedLines(refinedText: string): string {
  const lines = refinedText.split("\n");
  const REPEAT_THRESHOLD = 6;

  const freqMap = new Map<string, number>();

  // Count frequencies
  for (const line of lines) {
    const normalized = line.trim();
    if (normalized.length > 2) {
      freqMap.set(normalized, (freqMap.get(normalized) || 0) + 1);
    }
  }

  const cleanedLines: string[] = [];

  for (const line of lines) {
    const normalized = line.trim();
    const count = freqMap.get(normalized) || 0;

    if (count < REPEAT_THRESHOLD) cleanedLines.push(line);
  }

  return cleanedLines.join("\n");
}

function removePageNumbers(refinedText: string): string {
  const lines = refinedText.split("\n");
  const cleaned: string[] = []

  for (const line of lines) {
    const trimmed = line.trim();
    const isOnlyNumber = /^\d+$/.test(trimmed);

    const isPageNumber =
      /^page\s+\d+$/i.test(trimmed) ||
      /^page\s+\d+\s+of\s+\d+$/i.test(trimmed);

    if (!isOnlyNumber && !isPageNumber) cleaned.push(line);
    else continue
  }

  return cleaned.join('\n')
}

function mergeBrokenLines(text: string): string {
  const lines = text.split("\n");

  const merged: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i].trim();
    const next = lines[i + 1]?.trim();

    if (!current) {
      merged.push("");
      continue;
    }

    if (
      next &&
      !/[.!?:]$/.test(current) &&      // does NOT end sentence
      /^[a-z]/.test(next)             // next starts lowercase
    ) {
      lines[i + 1] = current + " " + next;
    } else {
      merged.push(current);
    }
  }

  return merged.join("\n");
}

function normalizeParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)   // split by blank lines
    .map(p => p.trim()) // clean edges
    .filter(p => p.length > 0); // remove empty ones
}

export { cleanPDFText, calculateWordCount, extractJsonArray, safeParseJsonArray, validateSlides, structureText };