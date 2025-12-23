import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const fileRouter = {

  pdfUploader: f({
    "application/pdf": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .onUploadComplete(async ({ metadata, file }) => {
      
      return {...file};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof fileRouter;
