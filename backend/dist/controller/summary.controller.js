"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSummaries = exports.deleteSummary = exports.getSummary = exports.generateSummary = void 0;
const apiError_1 = require("../utils/apiError");
const pdf_parse_1 = require("pdf-parse");
const asyncHandler_1 = require("../utils/asyncHandler");
const gemini_service_1 = require("../services/gemini.service");
const pdf_tools_1 = require("../utils/pdf.tools");
const summary_model_1 = require("../models/summary.model");
const generateSummary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user || !req.user.id) {
        throw new apiError_1.CustomError(401, "Unauthorized");
    }
    const { fileUrl, fileName } = req.body;
    if (!fileUrl || fileUrl.trim() === '') {
        throw new apiError_1.CustomError(400, 'File url is required');
    }
    const newSummary = new summary_model_1.Summary({
        userId: req.user.id,
        pdfUrl: fileUrl,
        fileName,
        status: 'processing'
    });
    await newSummary.save();
    const parser = new pdf_parse_1.PDFParse({ url: fileUrl });
    const { text } = await parser.getText();
    // refine text before sending to gemini
    const refinedText = (0, pdf_tools_1.cleanPDFText)(text);
    if (!refinedText.trim()) {
        newSummary.status = 'failed';
        newSummary.error = 'The PDF file is empty';
        await newSummary.save();
        throw new apiError_1.CustomError(400, 'The PDF file is empty');
    }
    // check for estimated token usage
    const { chunks, tokens, totalChunks } = (0, pdf_tools_1.generateChunks)(refinedText, req.user.isPro);
    console.log(`Processing ${totalChunks} chunk(s) with ~${tokens} tokens`);
    if (totalChunks === 1) {
        const { success, summary, status, message, tokensUsed } = await (0, gemini_service_1.getSummaryFromGemini)(refinedText);
        if (!success || !summary) {
            newSummary.status = 'failed';
            newSummary.error = message || 'Error generating summary from Gemini';
            newSummary.tokenUsed = tokensUsed || tokens;
            await newSummary.save();
            throw new apiError_1.CustomError(status, message);
        }
        newSummary.status = 'completed';
        newSummary.summaryText = summary;
        newSummary.tokenUsed = tokensUsed || tokens;
        await newSummary.save();
        return res.status(200).json({
            success: true,
            message: "Summary generated successfully",
            summary
        });
    }
    const summaries = [];
    let totalTokens = 0;
    for (const [i, chunk] of chunks.entries()) {
        const prompt = `Summarize part ${i + 1} of ${totalChunks}:\n\n${chunk}`;
        const { message, success, summary, status, tokensUsed } = await (0, gemini_service_1.getSummaryFromGemini)(chunk, prompt);
        if (!success || !summary) {
            newSummary.status = 'failed';
            newSummary.error = message || `Error generating summary for chunk ${i + 1}`;
            newSummary.tokenUsed = totalTokens + (tokensUsed || 0);
            await newSummary.save();
            throw new apiError_1.CustomError(status, message);
        }
        totalTokens += tokensUsed || 0;
        summaries.push(summary);
    }
    const finalPrompt = `Combine the following summaries into one coherent, well-structured final summary: ${summaries.join("\n\n")}`;
    const combinedText = summaries.join("\n\n---\n\n");
    const { success, summary, status, message, tokensUsed } = await (0, gemini_service_1.getSummaryFromGemini)(combinedText, finalPrompt);
    if (!success || !summary) {
        newSummary.status = 'failed';
        newSummary.error = message || 'Error generating final summary from Gemini';
        newSummary.tokenUsed = totalTokens + (tokensUsed || 0);
        await newSummary.save();
        throw new apiError_1.CustomError(status || 500, message || "Error generating summary from Gemini");
    }
    newSummary.status = 'completed';
    newSummary.summaryText = summary;
    newSummary.tokenUsed = totalTokens + (tokensUsed || 0);
    await newSummary.save();
    return res.status(200).json({
        success: true,
        message: "Summary generated successfully",
        summary
    });
});
exports.generateSummary = generateSummary;
const getSummary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
});
exports.getSummary = getSummary;
const deleteSummary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
});
exports.deleteSummary = deleteSummary;
const getAllSummaries = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
});
exports.getAllSummaries = getAllSummaries;
