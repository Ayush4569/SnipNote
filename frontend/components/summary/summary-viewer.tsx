'use client'
import { useState } from "react"
import { Button } from "../ui/button"
import { slides } from "./summarySlides"
import { AnimatePresence, motion } from 'framer-motion'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
export default function SummaryViewer({ summary }: { summary: string }) {
    const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0)
    const [direction, setDirection] = useState<1 | -1>(1)
    const handleNext = () => {
        setDirection(1)
        if (currentSlideIdx === slides.length - 1) setCurrentSlideIdx(0)
        else setCurrentSlideIdx((prev) => prev + 1)
    }
    const handlePrev = () => {
        setDirection(-1)
        if (currentSlideIdx === 0) setCurrentSlideIdx(slides.length - 1)
        else setCurrentSlideIdx((prev) => prev - 1)
    }
    return (
        <div className="w-screen h-[calc(100vh-16px)] flex items-center justify-center flex-col gap-4">

            <Card className="relative h-[70%] max-w-xl bg-white rounded-3xl shadow-md overflow-scroll">
                <div className="absolute top-5 left-0 right-0 flex justify-center gap-2">
                    {
                        slides.map((s, i) => {
                            return <div key={s.idx} className={`h-2 w-10 rounded-full transition-all ${i === currentSlideIdx ? 'bg-rose-500 ' : 'bg-gray-300'}`} />
                        })
                    }
                </div>
                <AnimatePresence  mode="wait">
                    <motion.div
                        key={currentSlideIdx}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -300 }}
                        transition={{ duration: 0.3 }}
                        className="mt-8 mb-14"
                    >
                        <CardHeader>
                            <CardTitle className="text-center text-2xl mb-6">
                                {slides[currentSlideIdx].heading}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-y-4">
                            {
                                slides[currentSlideIdx].points.map((point, i) => (
                                    <p key={i} className="border-1 rounded-lg text-gray-500 font-semibold p-2">{point}</p>
                                ))
                            }
                        </CardContent>
                    </motion.div>
                </AnimatePresence>
                <div className="absolute bottom-4 left-0 right-0 flex justify-between px-4">
                    <div
                        onClick={handlePrev}
                        className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white cursor-pointer"
                    >
                        <ChevronLeft />
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
    )
}