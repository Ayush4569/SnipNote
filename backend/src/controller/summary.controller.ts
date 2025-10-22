import { Request, Response } from 'express';
import { CustomError } from '../utils/apiError';
import { PDFParse } from 'pdf-parse';
import { asyncHandler } from '../utils/asyncHandler';
import { getSummaryFromGemini } from '../services/gemini.service';
import { cleanPDFText, generateChunks } from '../utils/pdf.tools';
import { Summary } from '../models/summary.model';

const generateSummary = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new CustomError(401, "Unauthorized")
  }
  const { fileUrl,fileName } = req.body;
  try {
    if(!fileUrl || fileUrl.trim() === '') {
      throw new CustomError(400, 'File url is required')
    }
    const newSummary = new Summary({
      user: req.user.id,
      fileUrl,
      fileName,
      status: 'processing'
    })
    const parser = new PDFParse({ url: fileUrl })
    const { text } = await parser.getText();

    // refine text before sending to gemini
    const refinedText = cleanPDFText(text)

    if (!refinedText.trim()) {
      await newSummary.updateOne({ status: 'failed',error:'The PDF file is empty' })
      throw new CustomError(400, 'The PDF file is empty')
    }
    // check for estimated token usage
    const { chunks, tokens, totalChunks } = generateChunks(refinedText)

    console.log(`Processing ${totalChunks} chunk(s) with ~${tokens} tokens`);

    if(totalChunks === 1) {
      const { success, summary, status, message } = await getSummaryFromGemini(refinedText);
      if (!success || !summary) {
        await newSummary.updateOne({ status: 'failed',error: message ?? 'Error generating summary from Gemini' })
        throw new CustomError(status, message);
      }
      await newSummary.updateOne({ status: 'completed', summary })
      return res.status(200).json({
        success: true,
        message: "Summary generated successfully",
        summary
      });
    }

    const summaries: string[] = []

    for (const [i, chunk] of chunks.entries()) {
      const prompt = `Summarize part ${i + 1} of ${totalChunks}:\n\n${chunk}`;
      const { message, success, summary, status } = await getSummaryFromGemini(chunk, prompt);
      if (!success || !summary) {
        await newSummary.updateOne({ status: 'failed' })
        throw new CustomError(status, message)
      }
      summaries.push(summary)
    }

    const finalPrompt = `Combine the following summaries into one coherent, well-structured final summary: ${summaries.join("\n\n")}`;
    const combinedText = summaries.join("\n\n---\n\n");
    const { success, summary, status, message } = await getSummaryFromGemini(combinedText, finalPrompt)

    if (!success || !summary) {
      await newSummary.updateOne({ status: 'failed' })
      throw new CustomError(status || 500, message || "Error generating summary from Gemini")
    }

    await newSummary.updateOne({ status: 'completed', summary })
    return res.status(200).json({
      success: true,
      message: "Summary generated successfully",
      summary
    })

  } catch (error) {
    console.log('error generating summary', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }

})
const getSummary = asyncHandler(async (req: Request, res: Response) => {

})

const deleteSummary = asyncHandler(async (req: Request, res: Response) => {

})
const getAllSummaries = asyncHandler(async (req: Request, res: Response) => {

})


export {
  generateSummary,
  getSummary,
  deleteSummary,
  getAllSummaries
}