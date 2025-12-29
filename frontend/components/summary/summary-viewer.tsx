'use client'

import { useState } from "react"
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
  className
}: {
  summaryText: SummarySlide[]
  className?: string
}) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0)

  const handleNext = () => {
    setCurrentSlideIdx((prev) =>
      prev === summaryText.length - 1 ? 0 : prev + 1
    )
  }

  const handlePrev = () => {
    setCurrentSlideIdx((prev) =>
      prev === 0 ? summaryText.length - 1 : prev - 1
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentSlideIdx * 100}%)` }}
      >
        {summaryText.map((slide, idx) => (

          <div key={idx} className="w-full shrink-0 px-0.5 ">
            <Card className="relative flex flex-col h-[60vh] sm:h-[65vh] max-h-[600px] rounded-3xl overflow-hidden  shadow-none sm:border sm:shadow-xs">
              <div className="absolute top-4 left-0 right-0 flex justify-center gap-2">
                {summaryText.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-5 sm:w-8 rounded-full ${
                      i === currentSlideIdx ? "bg-rose-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>

              <div className="flex-1 overflow-y-auto px-1 sm:px-6 pt-8 pb-14 no-scrollbar">
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-xl sm:text-2xl">
                    {slide.heading}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex flex-col gap-y-2">
                  {slide.points.map((point, i) => (
                    <p
                      key={i}
                      className="rounded-lg border border-rose-100 bg-rose-50/40 p-2 text-sm sm:text-base text-gray-600 font-medium"
                    >
                      {point}
                    </p>
                  ))}
                </CardContent>
              </div>

              <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-4 sm:px-6">
                <button
                  onClick={handlePrev}
                  className="h-10 w-10 rounded-full bg-rose-500 text-white flex items-center justify-center active:scale-95 shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex gap-2">
                  {summaryText.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        i === currentSlideIdx ? "bg-rose-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="h-10 w-10 rounded-full bg-rose-500 text-white flex items-center justify-center active:scale-95 shadow-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
