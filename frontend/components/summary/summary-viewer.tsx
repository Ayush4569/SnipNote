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
export default function SummaryViewer({ summaryText }: { summaryText: SummarySlide[] }) {
    const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0)
    const handleNext = () => {
        if (currentSlideIdx === summaryText.length - 1) setCurrentSlideIdx(0)
        else setCurrentSlideIdx((prev) => prev + 1)
    }
    const handlePrev = () => {
        if (currentSlideIdx === 0) setCurrentSlideIdx(summaryText.length - 1)
        else setCurrentSlideIdx((prev) => prev - 1)
    }
    return (
        <div className="w-full max-w-xl h-[550px] overflow-hidden">
            <div className="flex h-full transition-transform duration-300 ease-in-out "
                style={{ transform: `translateX(-${currentSlideIdx * 100}%)` }}
            >
                {summaryText.map((s, i) => (
                    <div
                        key={i}
                        className={`w-full flex-shrink-0 `}
                    >

                        <Card className="relative max-w-xl flex flex-col h-full rounded-3xl shadow-md overflow-hidden ">

                            {/* Horizontal top progress bars */}
                            <div className="absolute top-5 left-0 right-0 flex justify-center gap-2 z-10">
                                {
                                    summaryText.map((s, i) => {
                                        return <div key={i} className={`h-2 w-10 rounded-full transition-all ${i === currentSlideIdx ? 'bg-rose-500 ' : 'bg-gray-300'}`} />
                                    })
                                }
                            </div>

                            {/* Slides content */}
                            <div className="flex-1 overflow-y-auto px-4 pb-2 no-scrollbar mt-8 mb-14">
                                <CardHeader>
                                    <CardTitle className="text-center text-2xl mb-6">
                                        {summaryText[currentSlideIdx].heading}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-y-4 ">
                                    {
                                        summaryText[currentSlideIdx].points.map((point, i) => (
                                            <p key={i} className="border-1 rounded-lg text-gray-500 font-semibold p-2">{point}</p>
                                        ))
                                    }
                                </CardContent>
                            </div>

                            {/* Bottom next&prev buttons */}
                            <div className="absolute bottom-4 left-0 right-0 flex justify-between px-6 z-10">
                                <div
                                    onClick={handlePrev}
                                    className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white cursor-pointer"
                                >
                                    <ChevronLeft />
                                </div>
                                <div className="flex items-center gap-x-3">
                                    {summaryText.map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-2 w-2 rounded-full transition-all 
${i === currentSlideIdx ? 'bg-rose-500' : 'bg-gray-300'}`}
                                        />
                                    ))}
                                </div>

                                <div
                                    onClick={handleNext}
                                    className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white cursor-pointer "
                                >
                                    <ChevronRight />
                                </div>

                            </div>
                        </Card>


                    </div>
                ))}
            </div>
        </div>
    )
}