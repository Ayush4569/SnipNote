import Link from "next/link"
import { Card } from "../ui/card"
import { ArrowUpRight, Clock, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import DeleteButton from "./delete-button"
import { Summary } from "@/types/summary"
import { formatDistanceToNow } from "date-fns"
import { MotionDiv } from "../common/motion-helpers"
import { itemVariants } from "@/lib/constants"

export default function SummaryCard({
    _id,
    fileName,
    createdAt,
    error,
    status,
}: Summary) {
    return (
        <MotionDiv
            variants={itemVariants}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
        >
            <Card
                className="
                    group relative h-full flex flex-col justify-between overflow-hidden
                    bg-white/90 backdrop-blur-sm
                    border border-slate-200/80
                    rounded-2xl
                    shadow-xs hover:shadow-md hover:border-teal-300/80
                    transition-all duration-200
                "
            >
                {/* Delete button (isolated click) */}
                <div className="absolute top-3.5 right-3.5 z-10">
                    <DeleteButton summaryId={_id} />
                </div>

                <Link href={`/summary/${_id}`} className="flex flex-col flex-1 p-5 sm:p-6">
                    <div className="flex items-start gap-3.5 pr-8">
                        <div
                            className="
                                flex items-center justify-center
                                w-10 h-10 rounded-xl
                                bg-gradient-to-br from-teal-50 to-emerald-100 text-teal-700
                                ring-1 ring-teal-200/60
                                shrink-0
                                group-hover:scale-105 transition-transform duration-200
                            "
                        >
                            <FileText className="w-5 h-5 text-teal-600" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                                {fileName}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>
                                    {formatDistanceToNow(new Date(createdAt), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                        <StatusBadge
                            status={status as "processing" | "completed" | "failed"}
                            error={error}
                        />

                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:translate-x-0.5 transition-transform">
                            View summary
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                </Link>
            </Card>
        </MotionDiv>
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
        completed: "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
        processing: "bg-amber-50 text-amber-700 ring-amber-200/80",
        failed: "bg-rose-50 text-rose-700 ring-rose-200/80",
    }

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ring-1 capitalize",
                styles[status]
            )}
        >
            <span
                className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    status === "completed" && "bg-emerald-500",
                    status === "processing" && "bg-amber-500 animate-pulse",
                    status === "failed" && "bg-rose-500"
                )}
            />
            {status}
            {status === "failed" && error && (
                <span className="hidden sm:inline max-w-[120px] truncate">: {error}</span>
            )}
        </span>
    )
}
