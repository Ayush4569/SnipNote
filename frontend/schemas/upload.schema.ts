import { z } from 'zod';
export const fileUploadSchema = z.object({
    file: z
    .instanceof(File,{message:"Invalid file"})
    .refine((file) => file.type === 'application/pdf', "File must be a PDF")
    .refine((file) => file.size > 0, "File size must be greater than 0 bytes"),
})