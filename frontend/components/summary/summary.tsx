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
    <div className="relative isolate min-h-screen bg-gradient-to-b from-teal-50/60 to-blue-50">
      <BgGradient className="from-teal-400 via-blue-300 to-violet-200" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col gap-7 sm:gap-10"
        >
          <SummaryHeader
            createdAt={data.createdAt}
            readingTime={estimatedReadTime}
            title={data.fileName}
          />
          <SourceInfo
            fileName={data.fileName}
            originalFileUrl={data.pdfUrl}
            createdAt={data.createdAt}
            summaryText={data.summaryText || []}
          />
          <MotionDiv
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative"
          >
            <div className="
          relative
          rounded-xl sm:rounded-2xl
          bg-white/85 backdrop-blur
          border border-teal-100/40
          shadow-xl
          p-4 sm:p-7 lg:p-10
        ">
              <div className="absolute top-3 right-3 flex items-center gap-2 text-xs sm:text-sm bg-blue-50/90 px-3 py-1 rounded-full shadow font-mono text-blue-700">
                <FileText className="h-4 w-4 text-teal-400" />
                {data.wordCount?.toLocaleString()} words
              </div>
              <SummaryViewer summaryText={data.summaryText as SummarySlide[]} />
            </div>
          </MotionDiv>
        </MotionDiv>
      </div>
    </div>
  );
}