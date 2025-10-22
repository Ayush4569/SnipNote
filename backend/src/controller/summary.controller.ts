import { Request, Response } from 'express';
import { CustomError } from 'utils/apiError';
import { PDFParse } from 'pdf-parse';
import { asyncHandler } from '../utils/asyncHandler';
import { getSummaryFromGemini } from '../services/gemini.service';
import { cleanPDFText } from '../utils/pdf.tools';
const generateSummary = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new CustomError(401, "Unauthorized")
  }
  const { fileUrl } = req.body;
  try {
    const parser = new PDFParse({ url: fileUrl })
    const { text } = await parser.getText();

    const refinedText = cleanPDFText(text)

    const { message, success, summary } = await getSummaryFromGemini(refinedText);

    if (!success || !summary) {
      throw new CustomError(500, message || "Error generating summary from Gemini")
    }
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

export {
  generateSummary,
  getSummary,
  deleteSummary
}