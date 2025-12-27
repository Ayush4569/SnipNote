import BgGradient from "@/components/common/bg-gradient";
import { Skeleton } from "@/components/ui/skeleton";

function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-8 w-28 rounded-full bg-neutral-200" />
        <Skeleton className="h-4 w-40 rounded-full bg-neutral-200" />
        <Skeleton className="h-4 w-28 rounded-full bg-neutral-200" />
      </div>

      <Skeleton className="h-8 sm:h-10 w-full sm:w-3/4 rounded-lg bg-neutral-200" />
    </div>
  );
}

function SourceInfoSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-4 w-40 bg-neutral-200 rounded" />

      <div className="flex gap-2">
        <Skeleton className="h-8 w-28 bg-neutral-200 rounded-md" />
        <Skeleton className="h-8 w-36 bg-neutral-200 rounded-md" />
      </div>
    </div>
  );
}

function ViewerSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex flex-col h-[70vh] sm:h-[65vh] max-h-[600px] rounded-3xl bg-white/80 backdrop-blur-md shadow-md overflow-hidden">
        <div className="absolute top-4 left-0 right-0 flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-1.5 w-8 rounded-full bg-neutral-200"
            />
          ))}
        </div>

        <div className="flex-1 px-4 sm:px-6 pt-10 pb-16 space-y-4">
          <Skeleton className="h-6 w-3/4 mx-auto bg-neutral-200 rounded" />

          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-14 w-full bg-neutral-200 rounded-lg"
            />
          ))}
        </div>

        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-6">
          <Skeleton className="h-10 w-10 rounded-full bg-neutral-200" />
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-2 w-2 rounded-full bg-neutral-200"
              />
            ))}
          </div>
          <Skeleton className="h-10 w-10 rounded-full bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

export default function SummaryLoading() {
  return (
    <div className="relative isolate min-h-screen bg-linear-to-b from-rose-50/40 to-white">
      <BgGradient className="from-rose-400 via-rose-300 to-orange-200" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-16">
        <div className="flex flex-col gap-6 sm:gap-8">
          <HeaderSkeleton />
          <SourceInfoSkeleton />

          <div className="relative rounded-2xl sm:rounded-3xl bg-white/80 backdrop-blur-md border border-rose-100/30 shadow-lg p-3 sm:p-5 lg:p-8">
            <ViewerSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
