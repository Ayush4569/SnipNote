import { SummaryType } from "schemas/summary";
import { SUMMARY_SYSTEM_PROMPT } from "./system.prompt";

function cleanPDFText(rawText: string): string {
  return rawText
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')
    .replace(/_{3,}|-{3,}/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}


function estimateTokens(refinedText: string): {
  inputTokens: number;
  estimatedOutputTokens: number;
  estimatedTotal: number;
} {
  const pdfTokens = Math.ceil(refinedText.split(/\s+/).length * 0.75)

  const systemPromptTokens = Math.ceil(SUMMARY_SYSTEM_PROMPT.split(/\s+/).length * 0.75);

  const wrapperTokens = 75;

  const inputTokens = pdfTokens + systemPromptTokens + wrapperTokens;

  const estimatedOutputTokens = Math.ceil(inputTokens * 0.5);

  const estimatedTotal = inputTokens + estimatedOutputTokens;

  return {
    inputTokens,
    estimatedOutputTokens,
    estimatedTotal
  }

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
  const { estimatedTotal } = estimateTokens(refinedText)


  if (estimatedTotal <= maxTotalToken && estimatedTotal <= maxTokenPerChunk) {
    return {
      chunks: [refinedText],
      totalChunks: 1,
      tokens: estimatedTotal
    }
  }

  if (!isProUser && estimatedTotal > maxTotalToken) {
    const allowedWords = Math.floor((maxTotalToken / 0.75) * 4)
    refinedText = refinedText.substring(0, allowedWords)
  }
  const chunks: string[] = []
  const charsPerChunk = Math.floor((maxTokenPerChunk / 0.75) * 4);
  const overlapChars = Math.floor((overlapTokens / 0.75) * 4);

  let start = 0;
  while (start < refinedText.length) {
    const end = Math.min(start + charsPerChunk, refinedText.length)

    let chunk = refinedText.substring(start, end)

    if (end < refinedText.length) {
      const lastSpace = chunk.lastIndexOf(' ')
      if (lastSpace > charsPerChunk * 0.8) {
        chunk = chunk.substring(0, lastSpace)
      }
    }

    chunks.push(chunk)
    start = end - overlapChars
    if (start >= refinedText.length) break;
  }

  return {
    chunks,
    totalChunks: chunks.length,
    tokens: estimatedTotal
  }

}

function calculateWordCount(summary: SummaryType[]): number {
  const text = summary.flatMap(s => [s.heading, ...s.points])
    .join(' ')
    .replace(/\s+/g, " ")
    .trim()
  if (!text) return 0

  return text.replace(/[\p{Emoji_Presentation}\{Extended_Pictographic}]/gu, "").split(" ").length
}

function extractJsonArray(text:string):string {
  const firstBracket = text.indexOf('[')
  const lastBracket = text.lastIndexOf(']')
  if (firstBracket === -1 || lastBracket === -1) {
    throw new Error("No JSON array found in AI response")
  }
  return text.slice(firstBracket,lastBracket+1)
}

/*
  // check for estimated token usage
  const { chunks, tokens, totalChunks } = generateChunks(refinedText,req.user.isPro)

  console.log(`Processing ${totalChunks} chunk(s) with ~${tokens} tokens`);

  if(totalChunks === 1) {
    const { success, summary, status, message,tokensUsed } = await getSummaryFromGemini(refinedText);
    refinedText = ''
    if (!success || !summary) {
      newSummary.status = 'failed'
      newSummary.error = message || 'Error generating summary from Gemini'
      newSummary.tokenUsed = tokensUsed || tokens
      await newSummary.save()
      throw new CustomError(status, message);
    }
    newSummary.status = 'completed'
    newSummary.summaryText = summary
    newSummary.tokenUsed = tokensUsed || tokens
    await newSummary.save()
    return res.status(200).json({
      success: true,
      message: "Summary generated successfully",
      summary
    });
  }

  const summaries: string[] = []
  let totalTokens:number = 0
  for (let [i, chunk] of chunks.entries()) {
    const prompt = `Summarize part ${i + 1} of ${totalChunks}:\n\n${chunk}`;
    const { message, success, summary, status,tokensUsed } = await getSummaryFromGemini(chunk, prompt);
    chunk = ''
    if (!success || !summary) {
     newSummary.status = 'failed'
      newSummary.error = message || `Error generating summary for chunk ${i + 1}`
      newSummary.tokenUsed = totalTokens + (tokensUsed || 0)
      await newSummary.save()
      throw new CustomError(status, message)
    }
    totalTokens += tokensUsed || 0
    summaries.push(summary)
  }

  refinedText = ''
  chunks.length = 0

  const finalPrompt = `Combine the following summaries into one coherent, well-structured final summary: ${summaries.join("\n\n")}`;
  const combinedText = summaries.join("\n\n---\n\n");
  const { success, summary, status, message,tokensUsed } = await getSummaryFromGemini(combinedText, finalPrompt)

  summaries.length = 0 

  if (!success || !summary) {
    newSummary.status = 'failed'
    newSummary.error = message || 'Error generating final summary from Gemini'
    newSummary.tokenUsed = totalTokens + (tokensUsed || 0)
    await newSummary.save()
    throw new CustomError(status || 500, message || "Error generating summary from Gemini")
  }

  newSummary.status = 'completed'
  newSummary.summaryText = summary
  newSummary.tokenUsed = totalTokens + (tokensUsed || 0)
  await newSummary.save()

  if(global.gc) global.gc()
*/


export { estimateTokens, cleanPDFText, generateChunks,calculateWordCount,extractJsonArray };