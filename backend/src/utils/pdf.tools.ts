import { SummaryType } from "../schemas/summary";

/**
 * Sanitizes and normalizes extracted PDF text to remove corrupting symbols,
 * unprintable control characters, unpaired surrogates, and malformed encoding artifacts
 * while preserving valid language content, math symbols, and standard punctuation.
 */
function cleanPDFText(rawText: string): string {
  if (!rawText || typeof rawText !== "string") return "";

  let cleaned = rawText;

  // 1. Unicode normalization (NFC ensures composed characters and standard glyph representation)
  try {
    cleaned = cleaned.normalize("NFC");
  } catch {
    // ignore normalization failures on unsupported platforms
  }

  // 2. Remove common PDF header/footer page patterns (e.g. "-- 1 of 10 --")
  cleaned = cleaned.replace(/--\s*\d+\s*(?:of|\/)\s*\d+\s*--/gi, "");

  // 3. Remove unpaired UTF-16 surrogates that break JSON serialization / LLM tokenizers
  cleaned = cleaned.replace(
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,
    ""
  );

  // 4. Remove NULL bytes and dangerous C0 & C1 control codes (preserve \n, \r, \t)
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");

  // 5. Remove zero-width spaces, word-joiners, BOM, and bidirectional formatting overrides
  cleaned = cleaned.replace(
    /[\u200B-\u200D\uFEFF\u2060\u200E\u200F\u202A-\u202E\u2066-\u2069]/g,
    ""
  );

  // 6. Remove soft hyphens that split words arbitrarily in PDFs
  cleaned = cleaned.replace(/\u00AD/g, "");

  // 7. Replace Unicode replacement character (often emitted for unmapped PDF fonts)
  cleaned = cleaned.replace(/\uFFFD/g, " ");

  // 8. Replace Private Use Area characters (Wingdings, custom PDF font bullet glyphs)
  cleaned = cleaned.replace(/[\uE000-\uF8FF\uFFF0-\uFFFF]/g, " ");

  // 9. Normalize curly/smart quotes and prime symbols to standard quotes
  cleaned = cleaned
    .replace(/[“”„«»]/g, '"')
    .replace(/[‘’‚‹›`]/g, "'");

  // 10. Normalize typographical dashes (em-dash, en-dash, figure dash) to standard dash
  cleaned = cleaned.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");

  // 11. Normalize all exotic spaces (non-breaking, em-space, ideographic) to standard ASCII space
  cleaned = cleaned.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ");

  // 12. Collapse excessive repeating decorative symbols (e.g. "----------" or "........")
  cleaned = cleaned.replace(/([^\w\s])\1{5,}/g, "$1$1");

  // 13. Normalize line endings and collapse excessive whitespace
  cleaned = cleaned
    .replace(/\r\n|\r/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
}

function calculateWordCount(summary: SummaryType[]): number {
  if (!Array.isArray(summary)) return 0;
  const text = summary
    .flatMap((s) => [s.heading || "", ...(s.points || [])])
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return 0;

  try {
    return text
      .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "")
      .split(/\s+/)
      .filter(Boolean).length;
  } catch {
    return text.split(/\s+/).filter(Boolean).length;
  }
}

function findBalancedArrayEnd(text: string, startIdx: number): number {
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < text.length; i++) {
    const char = text[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === "[" || char === "{") {
        depth++;
      } else if (char === "]" || char === "}") {
        depth--;
        if (depth === 0) {
          return i;
        }
      }
    }
  }

  return -1;
}

function extractJsonArray(text: string): string | null {
  if (!text || typeof text !== "string") return null;

  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/i, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "").trim();
  }

  // 1. Direct top-level array with bracket balancing
  const firstBracket = cleaned.indexOf("[");
  if (firstBracket !== -1) {
    const balancedEnd = findBalancedArrayEnd(cleaned, firstBracket);
    if (balancedEnd !== -1) {
      return cleaned.slice(firstBracket, balancedEnd + 1);
    }
    // Truncated array: return entire substring from [ onwards for truncation repair
    return cleaned.slice(firstBracket);
  }

  // 2. Wrapped in an object (e.g. { "slides": [...] })
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace !== -1) {
    const balancedBraceEnd = findBalancedArrayEnd(cleaned, firstBrace);
    if (balancedBraceEnd !== -1) {
      return cleaned.slice(firstBrace, balancedBraceEnd + 1);
    }
    return cleaned.slice(firstBrace);
  }

  return null;
}

function repairTruncatedJsonArray(raw: string): any[] | null {
  if (!raw || typeof raw !== "string") return null;

  const startIdx = raw.indexOf("[");
  if (startIdx === -1) return null;

  const searchStr = raw.slice(startIdx);
  let lastCloseBrace = searchStr.lastIndexOf("}");

  while (lastCloseBrace > 0) {
    const candidate = searchStr.slice(0, lastCloseBrace + 1) + "]";
    try {
      const sanitized = candidate.replace(/,\s*([\]\}])/g, "$1");
      const parsed = JSON.parse(sanitized);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // try next previous closing brace
    }
    lastCloseBrace = searchStr.lastIndexOf("}", lastCloseBrace - 1);
  }

  return null;
}

function safeParseJsonArray(raw: string): any[] | null {
  if (!raw || typeof raw !== "string") return null;

  const tryExtractArray = (parsed: any): any[] | null => {
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.slides)) return parsed.slides;
      if (Array.isArray(parsed.summary)) return parsed.summary;
      if (Array.isArray(parsed.data)) return parsed.data;
    }
    return null;
  };

  // Step 1: Direct JSON.parse
  try {
    const parsed = JSON.parse(raw);
    const arr = tryExtractArray(parsed);
    if (arr) return arr;
  } catch {}

  // Step 2: Remove trailing commas
  try {
    const sanitized = raw.replace(/,\s*([\]\}])/g, "$1");
    const parsed = JSON.parse(sanitized);
    const arr = tryExtractArray(parsed);
    if (arr) return arr;
  } catch {}

  // Step 3: Repair truncated array
  const repaired = repairTruncatedJsonArray(raw);
  if (repaired && Array.isArray(repaired)) {
    return repaired;
  }

  return null;
}

function normalizeSlides(rawSlides: any[]): Array<{ heading: string; points: string[] }> {
  if (!Array.isArray(rawSlides)) return [];

  const normalized: Array<{ heading: string; points: string[] }> = [];

  for (const item of rawSlides) {
    if (!item || typeof item !== "object") continue;

    let heading = "";
    if (typeof item.heading === "string" && item.heading.trim()) {
      heading = item.heading.trim();
    } else if (typeof item.title === "string" && item.title.trim()) {
      heading = item.title.trim();
    } else if (typeof item.topic === "string" && item.topic.trim()) {
      heading = item.topic.trim();
    } else {
      heading = "Key Highlights";
    }

    const points: string[] = [];
    const rawPoints = Array.isArray(item.points)
      ? item.points
      : Array.isArray(item.bullets)
      ? item.bullets
      : Array.isArray(item.content)
      ? item.content
      : [];

    for (const p of rawPoints) {
      if (typeof p === "string" && p.trim()) {
        points.push(p.trim());
      } else if (p && typeof p === "object") {
        const text = p.text || p.point || p.bullet || JSON.stringify(p);
        if (typeof text === "string" && text.trim()) {
          points.push(text.trim());
        }
      }
    }

    if (points.length > 0) {
      normalized.push({ heading, points });
    }
  }

  return normalized;
}

function validateSlides(slides: any[]): boolean {
  if (!Array.isArray(slides) || slides.length === 0) return false;

  return slides.every(
    (slide) =>
      typeof slide === "object" &&
      slide !== null &&
      typeof slide.heading === "string" &&
      slide.heading.trim().length > 0 &&
      Array.isArray(slide.points) &&
      slide.points.length > 0 &&
      slide.points.every((p: unknown) => typeof p === "string" && p.trim().length > 0)
  );
}

function structureText(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];

  let cleaned = removeRepeatedLines(rawText);
  cleaned = removePageNumbers(cleaned);
  cleaned = mergeBrokenLines(cleaned);
  return normalizeParagraphs(cleaned);
}

function removeRepeatedLines(refinedText: string): string {
  const lines = refinedText.split("\n");
  const REPEAT_THRESHOLD = 6;

  const freqMap = new Map<string, number>();

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
  const cleaned: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isOnlyNumber = /^\d+$/.test(trimmed);

    const isPageNumber =
      /^page\s+\d+$/i.test(trimmed) ||
      /^page\s+\d+\s+of\s+\d+$/i.test(trimmed) ||
      /^--\s*\d+\s*--$/.test(trimmed);

    if (!isOnlyNumber && !isPageNumber) cleaned.push(line);
  }

  return cleaned.join("\n");
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
      !/[.!?:]$/.test(current) &&
      /^[a-z]/.test(next)
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
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

export {
  cleanPDFText,
  calculateWordCount,
  extractJsonArray,
  safeParseJsonArray,
  normalizeSlides,
  validateSlides,
  structureText,
};
