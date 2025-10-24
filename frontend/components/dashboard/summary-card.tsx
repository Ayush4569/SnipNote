import Link from "next/link";
import { Card } from "../ui/card";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import DeleteButton from "./delete-button";
import { Summary } from "@/types/summary";

export default function SummaryCard(
    {
        _id,
        pdfUrl,
        fileName,
        createdAt,
        updatedAt,
        summaryText,
        error,
        tokenUsed,
        status,
    }: Summary
) {
    return (
        <div>
            <Card className="relative h-full">
                <div className="absolute top-2 right-2">
                    <DeleteButton />
                </div>
                <Link href={`/summaries/${_id}`} className="block p-4 sm:p-6">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        <SummaryHeader
                            title={fileName}
                            createdAt={new Date(createdAt).toLocaleDateString()}
                            fileUrl={fileName} />
                        <p className="text-gray-600 line-clamp-2 text-sm sm:text-base  pl-2">
                            {summaryText ? summaryText : 'No summary available.'}
                        </p>
                        <div className="mt-2 flex justify-between items-center sm:mt-4">
                            <StatusBadge
                                status={status as 'processing' | 'completed' | 'failed'}
                            />
                        </div>
                    </div>
                </Link>
            </Card>
        </div>
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
        status
    }: {
        status: 'processing' | 'completed' | 'failed'
    }
) => {
    return (
        <span
            className={cn('px-3 py-1 text-xs font-medium rounded-full capitalize', status === 'completed' ? 'bg-green-100 text-green-800' : status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}
        >
            {status}
        </span>
    )
}