import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    picture: { type: String },
    googleId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    refreshToken: { type: String },
    pdfSummaryFile: [
        {
            type: Schema.Types.ObjectId,
            ref: "Summary"
        }
    ]
}, { timestamps: true })

export const User = model("User", userSchema);