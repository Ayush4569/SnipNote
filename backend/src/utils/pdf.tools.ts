function estimateTokens(text: string) {
    return Math.ceil(text.split(/\s+/).length * 1.3);
}

function cleanPDFText(rawText: string) {
    return rawText
        .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')
        .replace(/\n{2,}/g, '\n')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

export { estimateTokens, cleanPDFText };