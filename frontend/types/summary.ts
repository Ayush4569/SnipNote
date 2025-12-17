
export interface SummarySlide {
    idx: number
    heading: string
    points: string[]
}
export interface Summary {
    _id: string;
    pdfUrl: string;
    fileName: string;
    createdAt: Date;
    updatedAt: Date;
    summaryText: SummarySlide []| null;
    error?: string;
    tokenUsed?: number;
    status?: "processing" | "completed" | "failed" | null;
    wordCount?: number;
}