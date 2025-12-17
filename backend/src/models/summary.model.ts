import { Schema, model } from "mongoose";

const summarySchema = new Schema({
    pdfUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    summaryText: [
        {
            idx: { type: Number, required: true },
            heading: { type: String, required: true },
            points: { type: [String], required: true },
        },
        {_id:false}
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

export const Summary = model("Summary", summarySchema);