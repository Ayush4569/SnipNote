'use client'

import { deleteFile } from "@/app/actions/delete-file";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { queryClient } from "@/lib/tanstack";
import { useUploadThing } from "@/lib/upload-thing";
import { cn } from "@/lib/utils";
import { fileUploadSchema } from "@/schemas/upload.schema";
import axios, { isAxiosError } from "axios";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function UploadForm() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
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
                icon:
                    <Loader2Icon className="animate-spin" />
            })
        }
    })
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true)
        const data = new FormData(e.currentTarget)
        const file = data.get('file') as File
        const validatedFile = fileUploadSchema.safeParse({ file })
        if (!validatedFile.success) {
            toast.error(
                validatedFile.error.flatten().fieldErrors.file?.[0] ?? "Invalid file"
            )
            setLoading(false)
            return;
        }
        const response = await startUpload([file])
        
        if (!response || response.length === 0) {
            toast.error('Error uploading file')
            setLoading(false)
            return
        }
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/summary`, {
                fileUrl: response[0].ufsUrl,
                fileName: response[0].serverData.name
            },{
                withCredentials: true
            })
            if (data.success ) {
                toast.success(
                    data.message || 'File summarized successfully', { icon: '✅',duration: 3000 }
                )
                queryClient.invalidateQueries({ queryKey: ['summaries'] })
                router.push('/dashboard')
            }
        } catch (error: any) {
            console.log('Error uploading file', error);
            toast.error(
                isAxiosError(error) ? error.response?.data.message : 'Error uploading file')
            // delete the file from uploadthing
            deleteFile(response[0].key)
        } finally {
            uploadInputRef.current!.value = ''
            setLoading(false)
        }
    }
    return (
        <div className="flex flex-col gap-8 w-full max-w-2xl mx-auto">
            <form className="flex flex-col md:flex-row gap-6" onSubmit={handleSubmit}>
                <Input
                    id="file"
                    name="file"
                    type="file"
                    ref={uploadInputRef}
                    accept="application/pdf"
                    required
                    className={cn("file:border-0 file:bg-transparent file:mr-4", loading && 'opacity-50 cursor-not-allowed')}
                    disabled={loading}
                />
                <Button
                    disabled={loading}
                    type="submit"
                >
                    {loading ? (
                        <>
                            <Loader2Icon className="animate-spin h-4 w-4 mr-2" /> Uploading
                        </>
                    ) : 'Upload PDF'}
                </Button>
            </form>
        </div>
    )
}