import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MotionDiv, MotionH1, MotionH2, MotionSection } from "../common/motion-helpers";
import { containerVariants, itemVariants } from "@/lib/constants";

const buttonVariants = {
    scale: 1.05,
    transition: {
        type: "spring" as const,
        damping: 10,
        stiffness: 300,
    }
}

export default function Hero() {
    return (
        <MotionSection
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative mx-auto flex items-center justify-center z-0 flex-col py-16 sm:py-20 lg:pb-28 transition-all animate-in lg:px-12 max-w-7xl"
        >
            <MotionDiv
                variants={itemVariants}
                className="relative p-[1px] overflow-hidden rounded-full bg-linear-to-r from-rose-200 via-rose-500 to-rose-800 animate-gradient-x group ">
                <Badge
                    variant={'secondary'}
                    className="relative px-6 py-2 text-base font-medum bg-white rounded-full group-hover:bg-gray-50 transition-colors duration-200"
                >
                    <Sparkles className="h-6 w-6 lg:h-12 lg:w-12 mr-2 animate-pulse text-rose-500" />
                    <p className="text-base text-rose-600">Powered by AI</p>
                </Badge>
            </MotionDiv>
            <MotionH1 variants={itemVariants} className="font-bold text-center py-6 text-wrap w-[90%]">Generate summaries from PDFs</MotionH1>
            <MotionH2 variants={itemVariants} className="text-lg sm:text-xl lg:text-2xl text-center px-4 lg:px-0 lg:max-w-4xl text-gray-600">Get a beautiful concise summary of lengthy PDFs</MotionH2>
            <MotionDiv variants={itemVariants} whileHover={buttonVariants} >
                <Button variant='link' className="text-white mt-6 text-base sm:text-lg lg:text-xl rounded-full px-8 sm:px-10 lg:px-12 py-6 sm:py-7 lg:py-8 lg:mt-16 bg-linear-to-r from-slate-900 to-rose-500 hover:from-rose-500 hover:to-slate-900 hover:no-underline font-bold shadow-lg transition-all duration-300">
                    <Link href='/#pricing' className="flex items-center gap-2">
                        <span>Try Snipnote</span>
                        <ArrowRight className="animate-pulse" />
                    </Link>
                </Button>
            </MotionDiv>
        </MotionSection>
    );
}