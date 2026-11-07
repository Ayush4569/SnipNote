export class Chunking {
  private paragraphs: string[];
  private maxChars: number;

  constructor(paragraphs: string[], maxChars: number = 9000) {
    this.paragraphs = paragraphs;
    this.maxChars = Math.max(1000, maxChars);
  }

  /**
   * Splits an oversized paragraph into smaller chunks respecting sentence or word boundaries.
   */
  private splitOversizedParagraph(para: string): string[] {
    const parts: string[] = [];
    const sentences = para.split(/(?<=[.!?])\s+/);
    let currentPart = "";

    for (const sentence of sentences) {
      if (sentence.length > this.maxChars) {
        // If a single sentence exceeds maxChars, split by word or character slice
        if (currentPart) {
          parts.push(currentPart.trim());
          currentPart = "";
        }
        for (let i = 0; i < sentence.length; i += this.maxChars) {
          parts.push(sentence.slice(i, i + this.maxChars).trim());
        }
        continue;
      }

      if (currentPart.length + sentence.length + 1 > this.maxChars) {
        if (currentPart) {
          parts.push(currentPart.trim());
        }
        currentPart = sentence;
      } else {
        currentPart = currentPart ? `${currentPart} ${sentence}` : sentence;
      }
    }

    if (currentPart && currentPart.trim()) {
      parts.push(currentPart.trim());
    }

    return parts;
  }

  public buildChunks(): string[] {
    const chunks: string[] = [];
    let currentChunk = "";
    let currentSize = 0;

    for (const rawPara of this.paragraphs) {
      const para = rawPara.trim();
      if (!para) continue;

      const subParas =
        para.length > this.maxChars
          ? this.splitOversizedParagraph(para)
          : [para];

      for (const item of subParas) {
        const itemSize = item.length;

        if (currentSize + itemSize + 2 > this.maxChars) {
          if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
          }
          currentChunk = item + "\n\n";
          currentSize = itemSize + 2;
        } else {
          currentChunk += item + "\n\n";
          currentSize += itemSize + 2;
        }
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}
