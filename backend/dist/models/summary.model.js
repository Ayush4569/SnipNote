"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Summary = void 0;
const mongoose_1 = require("mongoose");
const summarySchema = new mongoose_1.Schema({
    pdfUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    summaryText: { type: String, default: null },
    error: {
        type: String
    },
    tokenUsed: {
        type: Number
    },
    status: {
        type: String,
        enum: ["processing", "completed", "failed", "none"],
        default: "none"
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });
exports.Summary = (0, mongoose_1.model)("Summary", summarySchema);
