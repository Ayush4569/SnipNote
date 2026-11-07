'use client'

import { useState, useEffect } from "react"
import { SummarySlide } from "@/types/summary"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function SummaryViewer({
  summaryText,
}: {
  summaryText: SummarySlide[]
}) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0)

  const totalSlides = summaryText?.length || 0;

  const handleNext = () => {
    if (totalSlides === 0) return;
    setCurrentSlideIdx((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    if (totalSlides === 0) return;
    setCurrentSlideIdx((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  // Optional keyboard navigation for better accessibility and UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalSlides]);

  if (!summaryText || summaryText.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        No slide content available.
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentSlideIdx * 100}%)` }}
      >
        {summaryText.map((slide, idx) => (
          <div key={idx} className="w-full shrink-0 px-1">
            <Card className="relative flex flex-col min-h-[520px] max-h-[660px] rounded-3xl overflow-hidden bg-white/95 border border-slate-200/80 shadow-md">
              {/* Slide content area */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-6 pb-20 no-scrollbar">
                <CardHeader className="p-0 pb-5 text-center border-b border-slate-100">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                    {slide.heading}
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-0 pt-5 flex flex-col gap-2.5">
                  {slide.points.map((point, i) => (
                    <div
                      key={i}
                      className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 sm:p-3.5 text-sm sm:text-base text-slate-700 transition-colors hover:bg-teal-50/40 hover:border-teal-100"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100/70 text-[11px] font-bold text-teal-700 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="flex-1 leading-relaxed text-slate-700 font-normal">
                        {point}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </div>

              {/* Simplified minimal navigation bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xs border-t border-slate-100 px-6 py-3.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous slide"
                  className="h-9 w-9 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 flex items-center justify-center transition-colors border border-slate-200/80 active:scale-95 shadow-2xs"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Single minimal indicator replacing top rectangular pills and bottom dots */}
                <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-slate-100/90 border border-slate-200/70 shadow-2xs">
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wider font-mono">
                    Page {currentSlideIdx + 1}/{totalSlides}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="h-9 w-9 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 flex items-center justify-center transition-colors border border-slate-200/80 active:scale-95 shadow-2xs"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
