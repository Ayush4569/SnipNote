
'use client';
import BgGradient from '@/components/common/bg-gradient';
import SummaryCard from '@/components/dashboard/summary-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth.context';
import { useGetSummaries } from '@/hooks/useGetSummaries';
import { ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import EmptySummaryState from './empty-summary';
import { MotionDiv, MotionH1, MotionP } from '../common/motion-helpers';
import { itemVariants } from '@/lib/constants';
import DashBoardLoadingSkeleton from '@/app/(post-login)/dashboard/loading';
import { useRouter } from 'next/navigation';

export default function DashboardComponent() {
    const { user, status } = useAuth();
    const router = useRouter()
    const { data: summaries = [], isPending, isError, error } = useGetSummaries(user?.id || '');
    if (status === 'unauthenticated') {
        router.push('/auth/login')
        return null
    }
    if (isPending) {
        return <DashBoardLoadingSkeleton />;
    }
    if (isError) {
        return (
            <div className='container mx-auto p-4'>
                <p className='text-red-600'>Error loading summaries: {error?.message}</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-100 via-violet-100 to-teal-100 relative overflow-x-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <BgGradient className="from-teal-300 via-blue-200 to-violet-100 opacity-60 animate-gradient-move" />
            </div>
            <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto flex flex-col gap-6 relative z-10"
            >
                <div className="px-2 py-10 sm:py-20">
                    <div className="flex gap-4 mb-8 justify-between items-center flex-wrap">
                        <div className="flex flex-col gap-2">
                            <MotionH1
                                variants={itemVariants}
                                initial="hidden"
                                whileInView="visible"
                                className="sm:text-5xl text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-700 to-violet-900 bg-clip-text text-transparent font-serif drop-shadow-lg"
                            >
                                Your Summaries
                            </MotionH1>
                            <MotionP
                                variants={itemVariants}
                                initial="hidden"
                                whileInView="visible"
                                className="text-blue-700 font-mono text-lg"
                            >
                                Transform your PDFs into concise, actionable insights
                            </MotionP>
                        </div>
                        <MotionDiv
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.05 }}
                            className={`self-start ${!user?.canGeneratePdf ? 'hidden' : 'block'}`}
                        >
                            <Button
                                variant={'link'}
                                className="bg-gradient-to-r from-teal-500 to-violet-600 hover:from-teal-600 hover:to-violet-700 hover:scale-105 transition-all duration-300 group hover:no-underline shadow-xl rounded-full px-6 py-2 text-lg"
                            >
                                <Link href="/upload" className="flex items-center text-white font-semibold">
                                    <Plus className="w-5 h-5 mr-2" />
                                    New Summary
                                </Link>
                            </Button>
                        </MotionDiv>
                    </div>
                    {user && !user.canGeneratePdf && (
                        <MotionDiv
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.05 }}
                            className="mb-6"
                        >
                            <div className="border bg-blue-50 border-teal-200 rounded-xl p-4 text-teal-800 font-mono shadow-md backdrop-blur-md">
                                <p className="text-sm">
                                    You&apos;ve reached the limit of uploads on your plan.{' '}
                                    <Link
                                        href="/#pricing"
                                        className="text-teal-800 underline font-medium underline-offset-4 inline-flex items-center"
                                    >
                                        Click here to upgrade to Pro{' '}
                                        <ArrowRight className="h-4 w-4 inline-block" />
                                    </Link>{' '}
                                    for more uploads.
                                </p>
                            </div>
                        </MotionDiv>
                    )}
                    {summaries.length === 0 ? (
                        <EmptySummaryState />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                            {summaries?.map((item) => (
                                <SummaryCard key={item._id} {...item} />
                            ))}
                        </div>
                    )}
                </div>
            </MotionDiv>

        </main>
    );
}


