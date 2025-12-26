'use client';
import { FileText } from "lucide-react";
import BgGradient from "../common/bg-gradient";
import SummaryHeader from "./summary-header";
import { useParams } from "next/navigation";
import { useGetSummaryById } from "@/hooks/useGetSummaryById";
import Loading from "@/app/loading";
import SummaryViewer from "./summary-viewer";
import { useMemo } from "react";
import SourceInfo from "./source-info";
import { SummarySlide } from "@/types/summary";
import { MotionDiv } from "../common/motion-helpers";




export default function SummaryComponent() {
    const { id } = useParams();
    const { data, isError, error, isPending } = useGetSummaryById({ summaryId: id as string });
    const estimatedReadTime = useMemo(() => {
        if (!data?.wordCount) return 0;
        const wordsPerMinute = 200;
        return Math.ceil(data.wordCount / wordsPerMinute);
    }, [data?.wordCount]);
    if (isPending) {
        return <Loading />;
    }
    if (isError) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="relative isolate min-h-screen bg-linear-to-b from-rose-50/40 to-white">
            <BgGradient className="from-rose-400 via-rose-300 to-orange-200" />
            <div className="container mx-auto flex flex-col gap-4">
                <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-24">
                    <MotionDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex flex-col">
                        <SummaryHeader createdAt={data.createdAt} readingTime={estimatedReadTime} title={data.fileName} />

                        {data.fileName && <SourceInfo fileName={data.fileName} originalFileUrl={data.pdfUrl} createdAt={data.createdAt} summaryText={data.summaryText || []} />}

                        <MotionDiv
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="relative mt-4 sm:mt-8 lg:mt-16">
                            <div className="relative p-4 sm:p-6 lg:p-8 bg-white/80 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-xl border border-rose-100/30 transition-all duration-300 hover:shadow-2xl hover:bg-white/90 max-w-4xl mx-auto">
                                <div className="absolute inset-0 bg-linear-to-br from-rose-50/50 via-orange-50/30 to-transparent opacity-50 rounded-2xl sm:rounded-3xl"></div>

                                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-white/90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-xs">
                                    <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-rose-400" />
                                    {data.wordCount?.toLocaleString()} words
                                </div>

                                <div className="relative mt-8 sm:mt-6 flex justify-center">
                                    <SummaryViewer summaryText={data.summaryText as SummarySlide[]} />
                                </div>
                            </div>
                        </MotionDiv>
                    </MotionDiv>
                </div>
            </div>
        </div>

    )
}