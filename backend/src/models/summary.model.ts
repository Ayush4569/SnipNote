import { Schema, model } from "mongoose";

const summarySchema = new Schema({
    pdfUrl: { type: String, required: true },
    fileName: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    summaryText: { type: String, required: true },
    status :{
        type: String,
        enum: ["processing", "completed", "failed","none"],
        default: "none"
    },
    userId : {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{timestamps:true})

export const Summary = model("Summary", summarySchema);