'use client'

import { deleteFile } from "@/app/actions/delete-file";
import { Button } from "@/components/ui/button"
import { queryClient } from "@/lib/tanstack";
import { useUploadThing } from "@/lib/upload-thing";
import { fileUploadSchema } from "@/schemas/upload.schema";
import axios, { isAxiosError } from "axios";
import { Loader2Icon, FileText, UploadCloud, XCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import UploadSummarySkeleton from "./summary-skeleton";
import { useAuth } from "@/context/auth.context";
import { cn } from "@/lib/utils";

export default function UploadForm() {
    const [loading, setLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const router = useRouter()
    const { user } = useAuth()
    const uploadInputRef = useRef<HTMLInputElement>(null);

    const { startUpload } = useUploadThing('pdfUploader', {
        onClientUploadComplete: () => {
            toast.success('File uploaded successfully', { icon: '✅' })
        },
        onUploadError: () => {
            toast.error('Error uploading file', { icon: '❌' })
        },
        onUploadBegin: () => {
            toast.info('Uploading file...', {
                icon: <Loader2Icon className="animate-spin" />
            })
        }
    })

    // Drag and drop handlers
    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === "application/pdf") {
            setSelectedFile(file);
        } else {
            toast.error("Please upload a single PDF file.");
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setSelectedFile(file);
        } else {
            toast.error("Please upload a single PDF file.");
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error("Please select a PDF file to upload.");
            return;
        }
        setLoading(true);

        const validatedFile = fileUploadSchema.safeParse({ file: selectedFile });
        if (!validatedFile.success) {
            toast.error(
                validatedFile.error.flatten().fieldErrors.file?.[0] ?? "Invalid file"
            );
            setLoading(false);
            return;
        }
        if (user?.isPro && selectedFile.size > 25 * 1024 * 1024) {
            toast.error('Pro users can only upload files up to 25MB');
            setLoading(false);
            return;
        } else if (!user?.isPro && selectedFile.size > 10 * 1024 * 1024) {
            toast.error('Free users can only upload files up to 10MB');
            setLoading(false);
            return;
        }

        const response = await startUpload([selectedFile]);
        if (!response || response.length === 0) {
            toast.error('Error uploading file');
            setLoading(false);
            return;
        }
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/summary`, {
                fileUrl: response[0].ufsUrl,
                fileName: response[0].serverData.name
            }, {
                withCredentials: true
            });
            if (data.success) {
                toast.success(
                    data.message || 'File summarized successfully', { icon: '✅', duration: 3000 }
                );
                queryClient.invalidateQueries({ queryKey: ['summaries'] });
                router.push(`/summary/${data.summaryId}`);
            }
        } catch (error: any) {
            toast.error(
                isAxiosError(error) ? error.response?.data.message : 'Error uploading file');
            deleteFile(response[0].key);
        } finally {
            setSelectedFile(null);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto px-2 sm:px-4">
            <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-muted-foreground text-sm">Upload PDF</span>
                </div>
            </div>
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
               
                <div
                    className={cn(
                        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-200 p-6 sm:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 w-full",
                        dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-gray-300 dark:border-gray-700",
                        loading && "opacity-60 pointer-events-none"
                    )}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    tabIndex={0}
                    aria-label="File Upload Dropzone"
                >
                    <input
                        id="file"
                        name="file"
                        type="file"
                        ref={uploadInputRef}
                        accept="application/pdf"
                        className={cn(
                            "absolute inset-0 w-full h-full opacity-0 cursor-pointer",
                            selectedFile && "pointer-events-none"
                        )}
                        disabled={loading}
                        onChange={handleFileChange}
                        tabIndex={-1}
                    />
                    {!selectedFile ? (
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                            <UploadCloud className="w-10 h-10 text-blue-500 mb-2 animate-bounce" />
                            <span className="font-semibold text-base sm:text-lg text-gray-700 dark:text-gray-200 text-center">Drag & drop your PDF here</span>
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">or tap to select a file</span>
                            <span className="mt-2 text-xs text-gray-400 text-center">Only single PDF file, max {user?.isPro ? "25MB" : "10MB"}</span>
                        </div>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-between">
                            <div className="flex items-center gap-2 w-full">
                                <FileText className="w-6 h-6 text-green-500" />
                                <div className="flex flex-col">
                                    <div className="font-medium text-gray-800 dark:text-gray-100 break-all">{selectedFile.name}</div>
                                    <div className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</div>
                                </div>
                            </div>


                            <Button
                                type="button"
                                onClick={removeFile}
                                aria-label="Remove file"
                                disabled={loading}
                                variant="ghost"
                                size="icon"
                                className="ml-auto sm:ml-0 mt-2 sm:mt-0 rounded-full border border-red-300 bg-white text-red-600 shadow-sm hover:text-white hover:bg-red-600 hover:border-red-600 focus:ring-2 focus:ring-red-300 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <Button
                    disabled={loading || !selectedFile}
                    type="submit"
                    className="w-full sm:w-auto font-semibold text-base shadow-lg transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2Icon className="animate-spin h-4 w-4 mr-2" /> Uploading
                        </>
                    ) : 'Upload PDF'}
                </Button>
            </form>
            {loading && (
                <>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-background px-3 text-muted-foreground text-sm">Processing</span>
                        </div>
                    </div>
                    <UploadSummarySkeleton />
                </>
            )}
        </div>
    )
}