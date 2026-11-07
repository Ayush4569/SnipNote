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
import { useAuth } from "@/context/auth.context";
import { useRouter } from "next/navigation";

export default function SummaryComponent() {
  const { id } = useParams();
  const {status} = useAuth()
  const router = useRouter()
  

  const { data, isError, error, isPending } =
    useGetSummaryById({ summaryId: id as string });

  const estimatedReadTime = useMemo(() => {
    if (!data?.wordCount) return 0;
    return Math.ceil(data.wordCount / 200);
  }, [data?.wordCount]);

  if(status === 'unauthenticated') {
    router.push('/auth/login')
    return null
  }

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
    <div className="relative isolate min-h-screen bg-gradient-to-b from-teal-50/50 via-slate-50 to-blue-50/60">
      <BgGradient className="from-teal-300/40 via-blue-200/40 to-violet-200/30 opacity-60" />
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col gap-6 sm:gap-8"
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
            transition={{ duration: 0.35, delay: 0.08, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-200/80 shadow-md p-4 sm:p-7 lg:p-8">
              <div className="flex justify-end mb-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium bg-slate-100/90 text-slate-600 px-3 py-1 rounded-full border border-slate-200/60 font-mono">
                  <FileText className="h-3.5 w-3.5 text-teal-600" />
                  <span>{data.wordCount?.toLocaleString() ?? 0} words analyzed</span>
                </div>
              </div>
              <SummaryViewer summaryText={data.summaryText as SummarySlide[]} />
            </div>
          </MotionDiv>
        </MotionDiv>
      </div>
    </div>
  );
}