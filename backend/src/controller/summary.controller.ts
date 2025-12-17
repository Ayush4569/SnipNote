import { Request, Response } from 'express';
import { CustomError } from '../utils/apiError';
import { PDFParse } from 'pdf-parse';
import { asyncHandler } from '../utils/asyncHandler';
import { getSummaryFromGemini } from '../services/gemini.service';
import { calculateWordCount, cleanPDFText } from '../utils/pdf.tools';
import { Summary } from '../models/summary.model';
import { fileUploadSchema } from '../schemas/upload';

import { User } from '../models/user.model';
import mongoose from 'mongoose';
import { Subscription } from '../models/subscription.model';
import { SummarySchema, SummaryType } from '../schemas/summary';
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


  let premiumUser = null;
  if (user.isPro) {
    premiumUser = await Subscription.findOne({ userId: user.id, status: 'active' })
    if (premiumUser && !premiumUser.canGeneratePdf()) {
      throw new CustomError(403, 'You have reached the monthly limit of PDF summaries for Pro users')
    }
  }

  const { fileUrl, fileName } = req.body;

  const result = fileUploadSchema.safeParse({ fileUrl, fileName });

  if (!result.success) {
    throw new CustomError(400, "Invalid file upload data");
  }
  const newSummary = new Summary({
    userId: user.id,
    pdfUrl: fileUrl,
    fileName,
    status: 'processing'
  })
  await newSummary.save()

  let parser: PDFParse;
  let pages: number = 0;
  try {
    parser = new PDFParse({ url: fileUrl })
    pages = (await parser.getInfo({ parsePageInfo: true })).total
  } catch (error) {
    newSummary.status = 'failed'
    newSummary.error = 'Error processing PDF file'
    await newSummary.save()
    throw new CustomError(500, 'Error processing PDF file')
  }

  if (pages === 0) {
    newSummary.status = 'failed'
    newSummary.error = 'The PDF file is empty'
    await newSummary.save()
    throw new CustomError(400, 'The PDF file is empty')
  }
  if (!user.isPro && pages > 10) {
    newSummary.status = 'failed'
    newSummary.error = 'Free tier users can only summarize PDFs with up to 10 pages'
    await newSummary.save()
    throw new CustomError(400, 'Free tier users can only summarize PDFs with up to 10 pages. Please upgrade to Pro for larger documents.')
  }

  if (user.isPro && pages > 50) {
    newSummary.status = 'failed'
    newSummary.error = 'Pro users can only summarize PDFs with up to 50 pages'
    await newSummary.save()
    throw new CustomError(400, 'Pro users can only summarize PDFs with up to 50 pages')
  }

  let refinedText: string
  try {
    const { text } = await parser.getText();
    refinedText = cleanPDFText(text);
  } finally {
    parser = null as any
  }

  if (!refinedText.trim()) {
    newSummary.status = 'failed'
    newSummary.error = 'PDF contains invalid content'
    await newSummary.save()
    throw new CustomError(400, 'PDF contains invalid content')
  }

  const { success, summary, status, message, tokensUsed } = await getSummaryFromGemini(refinedText)

  refinedText = ''
  const summaryValidationResult = SummarySchema.safeParse(summary)
  if (!summaryValidationResult.success) {
    newSummary.status = 'failed'
    newSummary.error = 'Gemini summary format error'
    newSummary.tokenUsed = (tokensUsed)

    await newSummary.save()

    throw new CustomError(status || 500, "Gemini summary format error")
  }

  if (!success || !summary) {
    newSummary.status = 'failed'
    newSummary.error = message || 'Error generating final summary from Gemini'
    newSummary.tokenUsed = (tokensUsed)

    await newSummary.save()

    throw new CustomError(status || 500, message || "Error generating summary from Gemini")
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      newSummary.$session(session);
      user.$session(session);
      premiumUser?.$session(session);

      newSummary.status = 'completed';
      newSummary.summaryText = summary;
      newSummary.tokenUsed = tokensUsed;
      await newSummary.save({ session });

      if (user.isPro && premiumUser) {
        await premiumUser.incrementPdfUsage(session);
      } else {
        await user.incrementPdfUsage(session);
      }
    });
  } catch (error: any) {
    console.error('Transaction failed:', error.message);
    throw new CustomError(500, 'Error finalizing summary generation')
  } finally {
    session.endSession()
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
  const wordCount = summary.summaryText ? calculateWordCount(summary.summaryText as SummaryType[]) : 0

  return res.status(200).json({
    success: true,
    summary: {
      ...summary.toObject(),
      wordCount
    }
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