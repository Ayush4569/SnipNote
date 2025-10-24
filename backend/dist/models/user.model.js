"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    picture: { type: String },
    googleId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    refreshToken: { type: String },
    isPro: { type: Boolean, default: false },
    pdfSummaryFile: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Summary"
        }
    ]
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
