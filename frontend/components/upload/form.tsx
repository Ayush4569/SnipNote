'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUploadThing } from "@/lib/upload-thing";
import { cn } from "@/lib/utils";
import { fileUploadSchema } from "@/schemas/upload.schema";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function UploadForm (){
    const [loading,setLoading] = useState(false)
    const {startUpload,routeConfig} = useUploadThing('pdfUploader',{
        onClientUploadComplete:()=>{
            toast.success('File uploaded successfully',{icon:'✅'})
        },
        onUploadError:()=>{
            toast.error('Error uploading file',{icon:'❌'})
        },
        onUploadBegin:()=>{
            toast.info('Uploading file...',{icon:
                <Loader2Icon className="animate-spin" />
            })
        }
    })
    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true)
        const data = new FormData(e.currentTarget)
        const file = data.get('file') as File
        const validatedFile = fileUploadSchema.safeParse({file})
        if(!validatedFile.success){
            toast.error(
                validatedFile.error.flatten().fieldErrors.file?.[0] ?? "Invalid file"
            )
        }
        const response = await startUpload([file])
        if(response) {
            setLoading(false)
        }
        try {
            
        } catch (error:any) {
            console.log('Error uploading file',error);
            toast.error(error.message ||'Error uploading file')
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
                        <Loader2Icon className="animate-spin h-4 w-4 mr-2"/> Uploading
                        </>
                    ) : 'Upload PDF'}
                    </Button>
            </form>
        </div>
    )
}