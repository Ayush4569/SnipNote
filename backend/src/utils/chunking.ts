export class Chunking {
  private paragraphs: string[]
  private maxChars: number
  constructor(paragraphs: string[], maxChars: number = 12000) {
    this.paragraphs = paragraphs;
    this.maxChars = maxChars
  }
  
  public buildChunks(): string[] {
    const chunks: string[] = [];
    let currentChunk: string = ""
    let currentSize = 0
    for (const para of this.paragraphs) {
      
      const paraSize = para.length
      if (paraSize > this.maxChars) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
          currentSize = 0;
        }
        chunks.push(para); // push alone
        continue;
      }

      if (currentSize + paraSize > this.maxChars) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
        currentSize = 0;
      }

      currentChunk += para + "\n\n";
      currentSize += paraSize;

    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;

  }

}
