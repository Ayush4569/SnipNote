import { Request, Response } from "express";
import { CustomError, failSummary } from "../utils/apiError";
import { PDFParse } from "pdf-parse";
import { asyncHandler } from "../utils/asyncHandler";
import { ChunkSummarizer, summarizeTextWithGemini } from "../services/gemini.service";
import {
  calculateWordCount,
  cleanPDFText,
  structureText,
} from "../utils/pdf.tools";
import { Summary } from "../models/summary.model";
import { fileUploadSchema } from "../schemas/upload";

import { User } from "../models/user.model";
import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model";
import { SummaryType } from "../schemas/summary";
import { Chunking } from "../utils/chunking";

const generateSummary = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new CustomError(401, "Unauthorized");

  const user = await User.findById(req.user.id);
  if (!user) throw new CustomError(401, "Unauthorized");

  // Tier Checks
  if (!user.isPro && user.pdfPerMonth <= 0) {
    throw new CustomError(403, "Monthly PDF limit reached. Upgrade to Pro.");
  }

  let premiumUser = null;
  if (user.isPro) {
    premiumUser = await Subscription.findOne({
      userId: user.id,
      status: "active",
    });
    if (premiumUser && !premiumUser.canGeneratePdf()) {
      throw new CustomError(403, "Pro monthly limit reached.");
    }
  }

  const { fileUrl, fileName } = req.body;
  const result = fileUploadSchema.safeParse({ fileUrl, fileName });
  if (!result.success) throw new CustomError(400, "Invalid file upload data");

  // 1. Create Summary Record in processing state
  const newSummary = await Summary.create({
    userId: user.id,
    pdfUrl: fileUrl,
    fileName,
    status: "processing",
  });

  // Start the processing block with global error handling for state safety
  try {
    let parser: PDFParse | null = null;
    let pages = 0;

    try {
      parser = new PDFParse({ url: fileUrl });
      pages = (await parser.getInfo({ parsePageInfo: true })).total;
    } catch (e) {
      await failSummary(
        newSummary,
        500,
        "Failed to read PDF. It might be password protected or corrupted.",
      );
    }

    if (!parser || !pages) {
      await failSummary(newSummary, 400, "PDF appears to be empty or invalid.");
    }

    // Page Limits
    if (!user.isPro && pages > 15)
      await failSummary(newSummary, 400, "Free tier limit: 15 pages max.");
    if (user.isPro && pages > 55)
      await failSummary(newSummary, 400, "Pro tier limit: 55 pages max.");

    const { text } = await parser!.getText();
    let refinedText = cleanPDFText(text);
    parser = null as any;

    if (!refinedText.trim()) {
      await failSummary(newSummary, 400, "PDF contains no extractable text.");
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

      const MAX_CHUNKS = 12;
      const MAX_TOTAL_TOKENS = 45000;
      const microNotes: string[] = [];
      const micro = new ChunkSummarizer(process.env.GEMINI_API_KEY!);

      if (chunks.length > MAX_CHUNKS) {
        await failSummary(
          newSummary,
          400,
          "Document is too long to process even with our chunked pipeline.",
        );
      }

      for (const chunk of chunks) {
        const { rawText, tokensUsed } = await micro.contructChunkSummary(chunk);
        microNotes.push(rawText);
        totalTokens += tokensUsed;

        if (totalTokens > MAX_TOTAL_TOKENS) {
          await failSummary(
            newSummary,
            400,
            "Document complexity exceeded processing limits.",
          );
        }
      }

      const mergedNotes = microNotes.join("\n\n");
      const targetSlides = Math.min(18, Math.max(5, Math.ceil(pages / 2.5)));

      const { slides, tokensUsed } = await micro.generateSlides(
        mergedNotes,
        targetSlides,
      );
      totalTokens += tokensUsed;

      finalSlides = slides.map((slide, idx) => ({
        idx,
        heading: slide.heading,
        points: slide.points,
      }));
    } else {
      const { success, summary, status, message, tokensUsed } =
        await summarizeTextWithGemini(refinedText);
      totalTokens = tokensUsed || 0;

      if (!success || !summary) {
        await failSummary(
          newSummary,
          status || 500,
          message || "AI processing failed",
          totalTokens,
        );
      }

      finalSlides = summary!.map((slide, idx) => ({
        idx,
        heading: slide.heading,
        points: slide.points,
      }));
    }

    // Success Transaction
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        newSummary.status = "completed";
        newSummary.summaryText = finalSlides;
        newSummary.tokenUsed = totalTokens;
        await newSummary.save({ session });

        if (user.isPro && premiumUser)
          await premiumUser.incrementPdfUsage(session);
        else await user.incrementPdfUsage(session);
      });
    } finally {
      session.endSession();
    }

    return res.status(200).json({
      success: true,
      message: "Summary generated successfully",
      summaryId: newSummary._id,
    });
  } catch (error: any) {
    console.error("Critical Summary Failure:", error);

    // If failSummary was already called, it throws CustomError - rethrow to errorHandler
    if (error instanceof CustomError) {
      throw error;
    }

    // For any unhandled runtime exceptions, ensure DB state is cleaned up
    await failSummary(
      newSummary,
      error.statusCode || 500,
      error.message || "An unexpected error occurred during processing.",
    );
  }
});

const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.user || !req.user.id) {
    throw new CustomError(401, "Unauthorized");
  }
  const summary = await Summary.findOne({
    _id: id,
    userId: req.user.id,
  }).select("-__v -userId");
  if (!summary) {
    throw new CustomError(404, "Summary not found");
  }
  const wordCount = summary.summaryText
    ? calculateWordCount(summary.summaryText as SummaryType[])
    : 0;

  return res.status(200).json({
    success: true,
    summary: {
      ...summary.toObject(),
      wordCount,
    },
  });
});

const deleteSummary = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!req.user || !req.user.id) {
    throw new CustomError(401, "Unauthorized");
  }
  const summary = await Summary.findOneAndDelete({
    _id: id,
    userId: req.user.id,
  });
  if (!summary) {
    throw new CustomError(404, "Summary not found");
  }
  return res.status(200).json({
    success: true,
    message: "Summary deleted successfully",
  });
});
const getAllSummaries = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.user.id) {
    throw new CustomError(401, "Unauthorized");
  }
  const summaries = await Summary.find({
    userId: req.user.id,
  })
    .select("-__v -userId")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    summaries,
  });
});

export { generateSummary, getSummary, deleteSummary, getAllSummaries };
