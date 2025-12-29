import BgGradient from "@/components/common/bg-gradient";
import { MotionDiv, MotionH1, MotionP } from "@/components/common/motion-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { itemVariants } from "@/lib/constants";

function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-8">
      <div className="flex flex-col gap-3">
        <MotionH1
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl font-bold tracking-tight"
        >
          <Skeleton className="h-10 w-48 bg-neutral-200 rounded-lg" />
        </MotionH1>

        <MotionH1
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <Skeleton className="h-6 w-72 sm:w-96 bg-neutral-200 rounded-md" />
        </MotionH1>
      </div>

      <MotionDiv
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="self-start"
      >
        <Skeleton className="h-10 w-32 bg-neutral-200 rounded-md" />
      </MotionDiv>
    </div>
  );
}

function SummaryCardSkeleton() {
  return (
    <MotionDiv
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      className="rounded-lg border bg-card text-card-foreground shadow-sm"
    >
      <Skeleton className="h-44 w-full rounded-lg bg-neutral-200" />
    </MotionDiv>
  );
}

export default function DashBoardLoadingSkeleton() {
  return (
    <div className="min-h-screen relative">
      <BgGradient className="from-emerald-200 via-teal-200 to-cyan-200" />

      <section className="container px-10 py-24 mx-auto flex flex-col gap-6">
        <HeaderSkeleton />

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SummaryCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
