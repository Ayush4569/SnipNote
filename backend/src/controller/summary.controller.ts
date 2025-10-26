import { Request, Response } from 'express';
import { CustomError } from '../utils/apiError';
import { PDFParse } from 'pdf-parse';
import { asyncHandler } from '../utils/asyncHandler';
import { getSummaryFromGemini } from '../services/gemini.service';
import { cleanPDFText, generateChunks } from '../utils/pdf.tools';
import { Summary } from '../models/summary.model';
import { fileUploadSchema } from '../schemas/upload';
import { logMemoryUsage } from '../utils/memory.usage';
import { User } from '../models/user.model';

const generateSummary = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new CustomError(401, "Unauthorized")
  }
  const user = await User.findById(req.user.id)

  if (!user) {
    throw new CustomError(401, "Unauthorized")
  }

  if (!user.isPro && user.pdfPerMonth <= 0) {
    throw new CustomError(403, 'You have reached the monthly limit of PDF summaries. Please upgrade to Pro for more access.')
  }

  // TODO : change this limit based on subscription plan
  // if(user.isPro && user.pdfPerMonth <=0) {
  //   throw new CustomError(403, 'You have reached the monthly limit of PDF summaries for Pro users. Please contact support for more access.')
  // }

  const { fileUrl, fileName } = req.body;

  const result = fileUploadSchema.safeParse({ fileUrl, fileName });

  if (!result.success) {
    throw new CustomError(400, "Invalid file upload data");
  }
  const newSummary = new Summary({
    userId: req.user.id,
    pdfUrl: fileUrl,
    fileName,
    status: 'processing'
  })
  await newSummary.save()

  const parser = new PDFParse({ url: fileUrl })
  const { total: pages } = await parser.getInfo({ parsePageInfo: true })



  if (pages === 0) {
    newSummary.status = 'failed'
    newSummary.error = 'The PDF file is empty'
    await newSummary.save()
    throw new CustomError(400, 'The PDF file is empty')
  }
  if (!req.user.isPro && pages > 10) {
    newSummary.status = 'failed'
    newSummary.error = 'Free tier users can only summarize PDFs with up to 10 pages'
    await newSummary.save()
    throw new CustomError(400, 'Free tier users can only summarize PDFs with up to 10 pages. Please upgrade to Pro for larger documents.')
  }

  if (req.user.isPro && pages > 100) {
    newSummary.status = 'failed'
    newSummary.error = 'Pro users can only summarize PDFs with up to 100 pages'
    await newSummary.save()
    throw new CustomError(400, 'Pro users can only summarize PDFs with up to 100 pages')
  }

  logMemoryUsage('Before PDF parse');
  const { text } = await parser.getText();
  logMemoryUsage('After PDF parse');
  let refinedText: string = cleanPDFText(text)


  const { success, summary, status, message, tokensUsed } = await getSummaryFromGemini(refinedText)


  if (!success || !summary) {
    newSummary.status = 'failed'
    newSummary.error = message || 'Error generating final summary from Gemini'
    newSummary.tokenUsed = (tokensUsed || 0)
    await newSummary.save()
    throw new CustomError(status || 500, message || "Error generating summary from Gemini")
  } else {
    newSummary.status = 'completed'
    newSummary.summaryText = summary
    newSummary.tokenUsed = (tokensUsed || 0)
 
    if (!user.isPro && user.pdfPerMonth > 0) {
      user.pdfPerMonth -= 1
    }
    else if (user.isPro && user.pdfPerMonth > 0) {
      user.pdfPerMonth -= 1
    }

    await user.save()
  }

  return res.status(200).json({
    success: true,
    message: "Summary generated successfully",
    summary
  })


})
const getSummary = asyncHandler(async (req: Request, res: Response) => {

  const { id } = req.params;
  if (!req.user || !req.user.id) {
    throw new CustomError(401, "Unauthorized")
  }
  const summary = await Summary.findOne({ _id: id, userId: req.user.id }).select('-__v -userId');
  if (!summary) {
    throw new CustomError(404, "Summary not found")
  }
  return res.status(200).json({
    success: true,
    summary
  })


})

const deleteSummary = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.user || !req.user.id) {
    throw new CustomError(401, "Unauthorized")
  }
  const summary = await Summary.findOneAndDelete({ _id: id, userId: req.user.id });
  if (!summary) {
    throw new CustomError(404, "Summary not found")
  }
  return res.status(200).json({
    success: true,
    message: "Summary deleted successfully"
  })
})
const getAllSummaries = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new CustomError(401, "Unauthorized")
  }
  const summaries = await Summary.find({
    userId: req.user.id
  }).select('-__v -userId').sort({ createdAt: -1 })

  return res.status(200).json({
    success: true,
    summaries
  })
})


export {
  generateSummary,
  getSummary,
  deleteSummary,
  getAllSummaries
}