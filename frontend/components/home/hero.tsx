'use client';
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MotionDiv, MotionH1, MotionH2, MotionSection } from "../common/motion-helpers";
import { containerVariants, itemVariants } from "@/lib/constants";
import { useAuth } from "@/context/auth.context";

const buttonVariants = {
    scale: 1.05,
    transition: {
        type: "spring" as const,
        damping: 10,
        stiffness: 300,
    }
}

export default function Hero() {
    const {status} = useAuth()
    return (
        <MotionSection
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative mx-auto flex items-center justify-center z-0 flex-col py-16 sm:py-20 lg:pb-28 transition-all animate-in lg:px-12 max-w-7xl font-[Montserrat,sans-serif]"
        >
            <MotionDiv
                variants={itemVariants}
                className="relative p-[2px] overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-200 via-violet-400 to-amber-400 animate-gradient-x group shadow-xl">
                <Badge
                    variant={'secondary'}
                    className="relative px-7 py-2.5 text-base font-semibold bg-white rounded-2xl group-hover:bg-gray-100 transition-colors duration-200 tracking-wide"
                >
                    <Sparkles className="h-7 w-7 lg:h-12 lg:w-12 mr-2 animate-pulse text-indigo-500" />
                    <p className="text-base text-indigo-700">Powered by AI</p>
                </Badge>
            </MotionDiv>
            <MotionH1 variants={itemVariants} className="font-extrabold text-center py-7 text-wrap w-[92%] text-4xl sm:text-5xl lg:text-6xl text-indigo-900 tracking-tight">Generate summaries from PDFs</MotionH1>
            <MotionH2 variants={itemVariants} className="text-lg sm:text-xl lg:text-2xl text-center px-4 lg:px-0 lg:max-w-4xl text-gray-700 font-medium" style={{fontFamily: 'Inter, sans-serif'}}>Get a beautiful concise summary of lengthy PDFs</MotionH2>
            <MotionDiv variants={itemVariants} whileHover={buttonVariants} >
                <Button variant='link' className="text-white mt-7 text-base sm:text-lg lg:text-xl rounded-2xl px-9 sm:px-11 lg:px-14 py-6 sm:py-7 lg:py-8 lg:mt-16 bg-gradient-to-r from-indigo-900 to-amber-400 hover:from-amber-400 hover:to-indigo-900 hover:no-underline font-bold shadow-2xl transition-all duration-300">
                    <Link href={
                        status === 'authenticated' ? '/upload' : '/auth/login'
                    } className="flex items-center gap-2">
                        <span>Try Snipnote</span>
                        <ArrowRight className="animate-pulse" />
                    </Link>
                </Button>
            </MotionDiv>
        </MotionSection>
    );
}