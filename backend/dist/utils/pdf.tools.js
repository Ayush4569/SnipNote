"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateTokens = estimateTokens;
exports.cleanPDFText = cleanPDFText;
exports.generateChunks = generateChunks;
const system_prompt_1 = require("./system.prompt");
function cleanPDFText(rawText) {
    return rawText
        .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')
        .replace(/_{3,}|-{3,}/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
}
function estimateTokens(refinedText) {
    const pdfTokens = Math.ceil(refinedText.split(/\s+/).length * 0.75);
    const systemPromptTokens = Math.ceil(system_prompt_1.SUMMARY_SYSTEM_PROMPT.split(/\s+/).length * 0.75);
    const wrapperTokens = 75;
    const inputTokens = pdfTokens + systemPromptTokens + wrapperTokens;
    const estimatedOutputTokens = Math.ceil(inputTokens * 0.5);
    const estimatedTotal = inputTokens + estimatedOutputTokens;
    return {
        inputTokens,
        estimatedOutputTokens,
        estimatedTotal
    };
}
function generateChunks(refinedText, isProUser = false) {
    const maxTotalToken = isProUser ? 100000 : 20000;
    const maxTokenPerChunk = isProUser ? 4000 : 2500;
    const overlapTokens = 300;
    const { estimatedTotal } = estimateTokens(refinedText);
    if (estimatedTotal <= maxTotalToken && estimatedTotal <= maxTokenPerChunk) {
        return {
            chunks: [refinedText],
            totalChunks: 1,
            tokens: estimatedTotal
        };
    }
    if (!isProUser && estimatedTotal > maxTotalToken) {
        const allowedWords = Math.floor(maxTotalToken / 0.75);
        refinedText = refinedText.split(/\s+/).slice(0, allowedWords).join(' ');
    }
    const words = refinedText.split(/\s+/);
    const chunks = [];
    const wordsPerChunk = Math.floor(maxTokenPerChunk / 0.75);
    const overlapWords = Math.floor(overlapTokens / 0.75);
    let start = 0;
    while (start < words.length) {
        const lastWord = Math.min(start + wordsPerChunk, words.length);
        const chunk = words.slice(start, lastWord).join(' ');
        chunks.push(chunk);
        start = lastWord - overlapWords;
        if (start >= words.length)
            break;
    }
    return {
        chunks,
        totalChunks: chunks.length,
        tokens: estimatedTotal
    };
}
