import Link from "next/link";
import { Card } from "../ui/card";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import DeleteButton from "./delete-button";
import { Summary } from "@/types/summary";
import { formatDistanceToNow } from "date-fns";
import { MotionDiv } from "../common/motion-helpers";
import { itemVariants } from "@/lib/constants";
export default function SummaryCard(
    {
        _id,
        pdfUrl,
        fileName,
        createdAt,
        error,
        tokenUsed,
        status,
    }: Summary
) {
    return (
        <MotionDiv
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.02,transition:{duration:0.2,ease:'easeOut'} }}>
            <Card className="relative h-full">
                <div className="absolute top-2 right-2">
                    <DeleteButton summaryId={_id} />
                </div>
                <Link href={`/summary/${_id}`} className="block p-4 sm:p-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <SummaryHeader
                            title={fileName}
                            createdAt={
                                formatDistanceToNow(new Date(createdAt), { addSuffix: true })
                            }
                            fileUrl={pdfUrl} />
                        
                        <div className="mt-2 flex justify-between items-center sm:mt-4">
                            <StatusBadge
                            error={error}
                                status={status as 'processing' | 'completed' | 'failed'}
                            />
                            <span>Tokens used: {tokenUsed || 0}</span>
                        </div>
                    </div>
                </Link>
            </Card>
        </MotionDiv>
    )
}

const SummaryHeader = ({ title, createdAt, fileUrl }: { title: string, createdAt: string, fileUrl: string }) => {
    return (
        <div className="flex items-center gap-2 sm:gap-4">
            <FileText className="w-6 h-6 text-rose-400 mt-1 sm:w-8 sm:h-8" />
            <div className="flex-1 min-w-0">
                <h3 className="text-base xl:text-lg font-semibold text-gray-900 truncate w-4/5 ">
                    {title}
                </h3>
                <p className="text-sm text-gray-500">{createdAt}</p>
            </div>
        </div>
    )
}

const StatusBadge = (
    {
        status,
        error
    }: {
        status: 'processing' | 'completed' | 'failed'
        error?: string
    }
) => {
    return (
        <span
            className={cn('px-3 py-1 text-xs font-medium rounded-full capitalize', status === 'completed' ? 'bg-green-100 text-green-800' : status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}
        >
            {status !== 'failed' ? status : `failed${error ? `: ${error}` : ''}`}
        </span>
    )
}