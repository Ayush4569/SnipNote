
function cleanPDFText(rawText: string): string {
    return rawText
      .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')
      .replace(/_{3,}|-{3,}/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }
  

function estimateTokens(refinedText: string): number {
    // 0.7 tokens per word limit
    // eg text = "This is a sample text."
    // words  = text.split(/\s+/) = ["This", "is", "a", "sample", "text."] (length = 5)
    // tokens = Math.ceil(5 * 0.7) = 3.5
    // return 3.5
    return Math.ceil(refinedText.split(/\s+/).length * 0.75)

}
interface GenerateChunksResult {
    chunks: string[];
    totalChunks: number;
    tokens: number;
}
function generateChunks(refinedText: string, isProUser = false): GenerateChunksResult {
    const maxTotalToken = isProUser ? 100000 : 20000
    const maxTokenPerChunk = isProUser ? 4000 : 2500
    const overlapTokens = 300;
    const tokens = estimateTokens(refinedText)


    if (tokens <= maxTotalToken && tokens <= maxTokenPerChunk) {
        return {
            chunks: [refinedText],
            totalChunks: 1,
            tokens
        }
    }

    if (!isProUser && tokens > maxTotalToken) {
        const allowedWords = Math.floor(maxTotalToken / 0.75)
        refinedText = refinedText.split(/\s+/).slice(0, allowedWords).join(' ')
    }
    const words = refinedText.split(/\s+/)
    const chunks: string[] = []
    const wordsPerChunk = Math.floor(maxTokenPerChunk / 0.75);
    const overlapWords = Math.floor(overlapTokens / 0.75);

    let start = 0;
    while (start < words.length) {
        const lastWord = Math.min(start + wordsPerChunk ,words.length)
        const chunk = words.slice(start, lastWord).join(' ')
        chunks.push(chunk)
        start = lastWord - overlapWords
        if (start >= words.length) break;
    }

    return {
        chunks,
        totalChunks: chunks.length,
        tokens
    }

}

export { estimateTokens, cleanPDFText, generateChunks };