import { z } from 'zod';
export const fileUploadSchema = z.object({
    file: z
    .instanceof(File,{message:"Invalid file"})
    .refine((file) => file.type === 'application/pdf', "File must be a PDF")
    .refine((file) => file.size <= 15 * 1024 * 1024, "File size must be less than 15MB"),
})