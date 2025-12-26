'use client';
import Loading from '@/app/loading';
import BgGradient from '@/components/common/bg-gradient';
import SummaryCard from '@/components/dashboard/summary-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth.context';
import { useGetSummaries } from '@/hooks/useGetSummaries';
import { ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import EmptySummaryState from './empty-summary';
import { Summary } from '@/types/summary';
import { MotionDiv, MotionH1, MotionP } from '../common/motion-helpers';
import { itemVariants } from '@/lib/constants';

export default function DashboardComponent() {
    const { user } = useAuth()
    const uploadLimit = 5;

    const { data: summaries = [], isPending, isError, error } = useGetSummaries(user?.id || '');

    if (isPending) {
        return <Loading />
    }
    else if (isError) {
        return <div className='container mx-auto p-4'>
            <p className='text-red-600'>Error loading summaries: {error?.message}</p>
        </div>
    }
    return (
        <main className="min-h-screen">
            <BgGradient className="from-emerald-200 via-teal-200 to-cyan-200" />
            <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
             className="container mx-auto flex flex-col gap-4">
                <div className="px-2 py-12 sm:py-24">
                    <div className="flex gap-4 mb-8 justify-between">
                        <div className="flex flex-col gap-2">
                            <MotionH1
                                variants={itemVariants}
                                initial="hidden"
                                whileInView="visible"
                                className="text-4xl font-bold tracking-tight bg-linear-to-r from-gray-600 to-gray-900 bg-clip-text text-transparent">Your Summaries</MotionH1>
                            <MotionP
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                className='text-gray-600'>Transform your PDFs into concise, actionable insights</MotionP>
                        </div>
                        <MotionDiv
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ scale: 1.05 }}
                            className='self-start'
                        >
                            <Button
                                variant={'link'}
                                className="bg-linear-to-r from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 hover:scale-105 transition-all duration-300 group hover:no-underline"
                            >
                                <Link href="/upload" className="flex items-center text-white">
                                    <Plus className="w-5 h-5 mr-2" />
                                    New Summary
                                </Link>
                            </Button>
                        </MotionDiv>
                    </div>
                    {/* The below thing should only be seen if the user upload limit is exhausted */}
                    <MotionDiv
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.05 }}
                        className='mb-6'>
                        <div className='border bg-rose-50 border-rose-200 rounded-lg p-4 text-rose-800'>
                            <p className='text-sm'>
                                You've reached the limit of {uploadLimit} uploads on the basic plan.{' '}
                                <Link
                                    href='/#pricing'
                                    className='text-rose-800 underline font-medium underline-offset-4 inline-flex items-center'
                                >
                                    Click here to upgrade to Pro{' '}
                                    <ArrowRight className='h-4 w-4 inline-block' />
                                </Link>{' '}
                                for unlimited uploads.
                            </p>
                        </div>
                    </MotionDiv>

                    {
                        summaries.length === 0 ? <EmptySummaryState /> : (
                            <div className='grid grid-cols-1 md:gd-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 sm'>
                                {
                                    summaries?.map((item) => (
                                        <SummaryCard
                                            key={item._id}
                                            {...item}
                                        />
                                    ))
                                }
                            </div>
                        )
                    }


                </div>
            </MotionDiv>
        </main>
    )
}