import { Request, Response } from 'express';
import { CustomError, failSummary } from '../utils/apiError';
import { PDFParse } from 'pdf-parse';
import { asyncHandler } from '../utils/asyncHandler';
import { ChunkSummarizer } from '../services/gemini.service';
import { calculateWordCount, cleanPDFText, structureText } from '../utils/pdf.tools';
import { Summary } from '../models/summary.model';
import { fileUploadSchema } from '../schemas/upload';

import { User } from '../models/user.model';
import mongoose from 'mongoose';
import { Subscription } from '../models/subscription.model';
import { SummaryType } from '../schemas/summary';
import { Chunking } from '../utils/chunking';
import { summarizeTextWithGemini } from '../services/sample';

const generateSummary = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new CustomError(401, "Unauthorized");


  const user = await User.findById(req.user.id);
  if (!user) throw new CustomError(401, "Unauthorized");


  if (!user.isPro && user.pdfPerMonth <= 0) {
    throw new CustomError(403, 'Monthly PDF limit reached. Upgrade to Pro.');
  }


  let premiumUser = null;
  if (user.isPro) {
    premiumUser = await Subscription.findOne({ userId: user.id, status: 'active' });
    if (premiumUser && !premiumUser.canGeneratePdf()) {
      throw new CustomError(403, 'Pro monthly limit reached.');
    }
  }


  const { fileUrl, fileName } = req.body;
  const result = fileUploadSchema.safeParse({ fileUrl, fileName });
  if (!result.success) throw new CustomError(400, "Invalid file upload data");


  const newSummary = await Summary.create({
    userId: user.id,
    pdfUrl: fileUrl,
    fileName,
    status: 'processing'
  });


  let parser: PDFParse | null;
  let pages = 0;


  try {
    parser = new PDFParse({ url: fileUrl });
    pages = (await parser.getInfo({ parsePageInfo: true })).total;
  } catch {
    await failSummary(newSummary, 500, 'Error processing PDF file');
    return;
  }


  if (!parser) await failSummary(newSummary, 400, 'Parser not initialized');
  else if (!pages) await failSummary(newSummary, 400, 'PDF is empty');


  else if (!user.isPro && pages > 15)
    await failSummary(newSummary, 400, 'Free tier limit: 15 pages max.');


  else if (user.isPro && pages > 55)
    await failSummary(newSummary, 400, 'Pro tier limit: 55 pages max.');


  const { text } = await parser.getText();

  let refinedText = cleanPDFText(text);
  parser = null as any;


  if (!refinedText.trim()) {
    await failSummary(newSummary, 400, 'PDF contains invalid content');
    return;
  }

  const paragraphs = structureText(refinedText);

  const SAFE_SINGLE_PASS_LIMIT = 10000;
  const shouldChunk = refinedText.length > SAFE_SINGLE_PASS_LIMIT;


  let finalSlides: SummaryType[] = [];
  let totalTokens = 0;


  if (shouldChunk) {

    const MAX_CHUNK_SIZE = 9000;
    const builder = new Chunking(paragraphs, MAX_CHUNK_SIZE);
    const chunks = builder.buildChunks();
    console.log('total chunks created :', chunks.length);
    const MAX_CHUNKS = 10;
    const MAX_TOTAL_TOKENS = 30000;
    let chunkCount = 0;
    const microNotes: string[] = [];
    const micro = new ChunkSummarizer(process.env.GEMINI_API_KEY!);

    for (const chunk of chunks) {
      console.log('chunks generated :', ++chunkCount);

      if (chunkCount > MAX_CHUNKS)
        await failSummary(newSummary, 400, 'Document too large to process.');

      const { rawText, tokensUsed } = await micro.contructChunkSummary(chunk)
      microNotes.push(rawText);
      totalTokens += tokensUsed || 0;

      console.log('tokens used after chunk :', totalTokens);

      if (totalTokens > MAX_TOTAL_TOKENS)
        await failSummary(newSummary, 400, 'Token limit exceeded.');
    }
    const mergedNotes = microNotes.join("\n\n");
    const targetSlides = Math.min(16, Math.max(4, Math.ceil(pages / 3)));
    console.log('target slides :', targetSlides);
    
    const { slides, tokensUsed } = await micro.generateSlides(
      mergedNotes,
      targetSlides
    );
    totalTokens += tokensUsed;
    console.log('tokens used after slide generation :', totalTokens);

    finalSlides = slides.map((slide, idx) => ({
      idx,
      heading: slide.heading,
      points: slide.points
    }));

  }



  else {
    const { success, summary, status, message, tokensUsed } =
      await summarizeTextWithGemini(refinedText);


    totalTokens = tokensUsed || 0;


    if (!success || !summary)
      await failSummary(newSummary, status || 500, message || 'Summary failed', totalTokens);


    finalSlides = summary!.map((slide, idx) => ({
      idx,
      heading: slide.heading,
      points: slide.points
    }));
  }


  refinedText = '';


  const session = await mongoose.startSession();


  try {
    await session.withTransaction(async () => {
      newSummary.$session(session);
      user.$session(session);
      premiumUser?.$session(session);


      newSummary.status = 'completed';
      newSummary.summaryText = finalSlides;
      newSummary.tokenUsed = totalTokens;


      await newSummary.save({ session });


      if (user.isPro && premiumUser)
        await premiumUser.incrementPdfUsage(session);
      else
        await user.incrementPdfUsage(session);
    });
  } finally {
    session.endSession();
  }


  return res.status(200).json({
    success: true,
    message: "Summary generated successfully",
    summaryId: newSummary._id
  });
});

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