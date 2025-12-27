'use client';

import { FileText } from "lucide-react";
import BgGradient from "../common/bg-gradient";
import SummaryHeader from "./summary-header";
import { useParams } from "next/navigation";
import { useGetSummaryById } from "@/hooks/useGetSummaryById";
import SummaryViewer from "./summary-viewer";
import { useMemo } from "react";
import SourceInfo from "./source-info";
import { SummarySlide } from "@/types/summary";
import { MotionDiv } from "../common/motion-helpers";
import SummaryLoading from "@/app/(post-login)/summary/loading";

export default function SummaryComponent() {
  const { id } = useParams();

  const { data, isError, error, isPending } =
    useGetSummaryById({ summaryId: id as string });

  const estimatedReadTime = useMemo(() => {
    if (!data?.wordCount) return 0;
    return Math.ceil(data.wordCount / 200);
  }, [data?.wordCount]);

  if (isPending) {
    return <SummaryLoading />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="relative isolate min-h-screen bg-linear-to-b from-rose-50/40 to-white">
      <BgGradient className="from-rose-400 via-rose-300 to-orange-200" />

      {/* Main wrapper */}
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-6 sm:gap-8"
        >
          {/* Header */}
          <SummaryHeader
            createdAt={data.createdAt}
            readingTime={estimatedReadTime}
            title={data.fileName}
          />

          {/* Source info */}
          <SourceInfo
            fileName={data.fileName}
            originalFileUrl={data.pdfUrl}
            createdAt={data.createdAt}
            summaryText={data.summaryText || []}
          />

          {/* Viewer Card */}
          <MotionDiv
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative"
          >
            <div className="
              relative
              rounded-2xl sm:rounded-3xl
              bg-white/80 backdrop-blur-md
              border border-rose-100/30
              shadow-lg
              p-3 sm:p-5 lg:p-8
            ">
              {/* word count badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5 text-xs sm:text-sm bg-white/90 px-3 py-1 rounded-full shadow">
                <FileText className="h-4 w-4 text-rose-400" />
                {data.wordCount?.toLocaleString()} words
              </div>

              <SummaryViewer
                summaryText={data.summaryText as SummarySlide[]}
              />
            </div>
          </MotionDiv>
        </MotionDiv>
      </div>
    </div>
  );
}