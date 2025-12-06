export interface Summary {
    _id: string;
    pdfUrl: string;
    fileName: string;
    createdAt: Date;
    updatedAt: Date;
    summaryText: string | null;
    error?: string;
    tokenUsed?: number;
    status?: "processing" | "completed" | "failed" | null;
    wordCount?: number;
}