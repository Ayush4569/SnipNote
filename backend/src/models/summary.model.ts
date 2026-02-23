import mongoose, { Document, Model, Schema, model } from "mongoose";

export interface Summary extends Document {
    pdfUrl: string;
    fileName: string;
    createdAt: Date;
    updatedAt: Date;
    summaryText: {
        idx: number;
        heading: string;
        points: string[];
    }[];
    error?: string;
    tokenUsed?: number;
    status?: "processing" | "completed" | "failed" | null;
    userId: mongoose.Types.ObjectId;
}

const summarySchema = new Schema<Summary>({
    pdfUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    summaryText: [
       new mongoose.Schema( {
            idx: { type: Number, required: true },
            heading: { type: String, required: true },
            points: { type: [String], required: true },
        },
        {_id: false}
    )
    ],
    error: {
        type: String
    },
    tokenUsed: {
        type: Number
    },
    status: {
        type: String,
        enum: ["processing", "completed", "failed"],
        default: null
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true })

export const Summary = model<Summary, Model<Summary, {}, {}>>('Summary', summarySchema);