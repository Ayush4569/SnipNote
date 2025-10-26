import z from "zod";

export const fileUploadSchema = z.object({
    fileUrl: z.string().url("Invalid file URL"),
    fileName: z.string().min(1, "File name is required"),
})