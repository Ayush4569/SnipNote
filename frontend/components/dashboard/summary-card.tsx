import Link from "next/link"
import { Card } from "../ui/card"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import DeleteButton from "./delete-button"
import { Summary } from "@/types/summary"
import { formatDistanceToNow } from "date-fns"
import { MotionDiv } from "../common/motion-helpers"
import { itemVariants } from "@/lib/constants"

export default function SummaryCard({
    _id,
    pdfUrl,
    fileName,
    createdAt,
    error,
    tokenUsed,
    status,
}: Summary) {
    return (
        <MotionDiv
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            <Card
                className="
          relative h-full overflow-hidden
          bg-gradient-to-br from-white to-gray-50
          border border-gray-200/70
          shadow-sm
          transition-all duration-200
          hover:shadow-lg hover:border-gray-300
        "
            >
                {/* Delete */}
                <div className="absolute top-3 right-3 z-10">
                    <DeleteButton summaryId={_id} />
                </div>

                <Link href={`/summary/${_id}`} className="block p-5 sm:p-6">
                    <div className="flex flex-col gap-4">
                        <SummaryHeader
                            title={fileName}
                            createdAt={formatDistanceToNow(new Date(createdAt), {
                                addSuffix: true,
                            })}
                        />

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <StatusBadge
                                status={status as "processing" | "completed" | "failed"}
                                error={error}
                            />

                            <span className="text-xs text-gray-500 font-medium">
                                {tokenUsed ?? 0} tokens
                            </span>
                        </div>
                    </div>
                </Link>
            </Card>
        </MotionDiv>
    )
}
const SummaryHeader = ({
    title,
    createdAt,
}: {
    title: string
    createdAt: string
}) => {
    return (
        <div className="flex items-start gap-4">
            <div
                className="
            flex items-center justify-center
            w-10 h-10 rounded-lg
            bg-rose-50 text-rose-500
            ring-1 ring-rose-100
            shrink-0
          "
            >
                <FileText className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                    {title}
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                    Created {createdAt}
                </p>
            </div>
        </div>
    )
}
const StatusBadge = ({
    status,
    error,
}: {
    status: "processing" | "completed" | "failed"
    error?: string
}) => {
    const styles = {
        completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        processing: "bg-amber-50 text-amber-700 ring-amber-200",
        failed: "bg-rose-50 text-rose-700 ring-rose-200",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ring-1 capitalize",
                styles[status]
            )}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {status}
            {status === "failed" && error && (
                <span className="hidden sm:inline">: {error}</span>
            )}
        </span>
    )
}
