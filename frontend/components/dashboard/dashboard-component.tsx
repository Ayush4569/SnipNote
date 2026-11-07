'use client';

import BgGradient from '@/components/common/bg-gradient';
import SummaryCard from '@/components/dashboard/summary-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth.context';
import { useGetSummaries } from '@/hooks/useGetSummaries';
import { ArrowRight, FileCheck, Layers, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import EmptySummaryState from './empty-summary';
import { MotionDiv, MotionH1, MotionP } from '../common/motion-helpers';
import { containerVariants, itemVariants } from '@/lib/constants';
import DashBoardLoadingSkeleton from '@/app/(post-login)/dashboard/loading';
import { useRouter } from 'next/navigation';

export default function DashboardComponent() {
    const { user, status } = useAuth();
    const router = useRouter();
    const { data: summaries = [], isPending, isError, error } = useGetSummaries(user?.id || '');

    if (status === 'unauthenticated') {
        router.push('/auth/login');
        return null;
    }

    if (isPending) {
        return <DashBoardLoadingSkeleton />;
    }

    if (isError) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-6 text-center text-rose-700">
                    <p className="font-semibold text-lg">Error loading summaries</p>
                    <p className="text-sm mt-1 text-rose-600">{error?.message || 'Something went wrong.'}</p>
                </div>
            </div>
        );
    }

    const completedCount = summaries.filter(s => s.status === 'completed').length;

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-50/70 via-slate-50 to-teal-50/60 relative overflow-x-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <BgGradient className="from-teal-300/40 via-blue-200/40 to-violet-200/30 opacity-60 animate-gradient-move" />
            </div>

            <MotionDiv
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-14 relative z-10 flex flex-col gap-8"
            >
                {/* Header section */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-2 max-w-2xl">
                        <div className="inline-flex items-center gap-2 self-start rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200/80">
                            <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                            <span>Workspace Overview</span>
                        </div>
                        <MotionH1
                            variants={itemVariants}
                            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-sans"
                        >
                            Your Summaries
                        </MotionH1>
                        <MotionP
                            variants={itemVariants}
                            className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed"
                        >
                            Review, search, and navigate through your AI-compressed technical slides.
                        </MotionP>
                    </div>

                    <MotionDiv
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="self-start md:self-end"
                    >
                        <Button
                            asChild
                            className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold rounded-xl px-5 py-2.5 shadow-md shadow-teal-700/10 transition-all duration-200"
                        >
                            <Link href="/upload" className="flex items-center gap-2">
                                <Plus className="w-4 h-4" />
                                <span>New Summary</span>
                            </Link>
                        </Button>
                    </MotionDiv>
                </div>

                {/* Quick metrics bar */}
                <MotionDiv variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                                <Layers className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Summaries</p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{summaries.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-4 sm:p-5 shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                                <FileCheck className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed</p>
                                <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">{completedCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-xs p-4 sm:p-5 shadow-xs flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Plan Status</p>
                            <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                                {user?.isPro ? 'Pro Member' : 'Basic Plan'}
                            </p>
                        </div>
                        {!user?.isPro && (
                            <Link
                                href="/#pricing"
                                className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-2 flex items-center gap-1"
                            >
                                Upgrade
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        )}
                    </div>
                </MotionDiv>

                {/* Limit reached warning if applicable */}
                {user && !user.canGeneratePdf && (
                    <MotionDiv
                        variants={itemVariants}
                        className="rounded-2xl border border-amber-200/80 bg-amber-50/80 backdrop-blur-xs p-4 sm:p-5 text-amber-900 shadow-xs"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                            <p>
                                <span className="font-semibold">Upload limit reached:</span> You have reached the monthly quota for your current plan.
                            </p>
                            <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="self-start sm:self-auto border-amber-300 text-amber-900 hover:bg-amber-100"
                            >
                                <Link href="/#pricing" className="inline-flex items-center gap-1.5 font-medium">
                                    <span>Upgrade to Pro</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </MotionDiv>
                )}

                {/* Document grid */}
                {summaries.length === 0 ? (
                    <EmptySummaryState />
                ) : (
                    <MotionDiv
                        variants={containerVariants}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                    >
                        {summaries.map((item) => (
                            <SummaryCard key={item._id} {...item} />
                        ))}
                    </MotionDiv>
                )}
            </MotionDiv>
        </main>
    );
}
