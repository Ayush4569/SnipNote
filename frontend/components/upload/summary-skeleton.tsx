import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function LoadingSkeleton() {
  return (
    <Card className="relative w-full max-w-[600px] mx-auto h-[70vh] sm:h-[600px] overflow-hidden bg-linear-to-br from-background via-background/95 to-rose-500/5 backdrop-blur-lg shadow-2xl rounded-3xl border border-rose-500/10">
      <div className="absolute top-0 left-0 right-0 z-20 bg-background/80 backdrop-blur-xs pt-4 pb-2 border-b border-rose-500/10">
        <div className="px-4 flex gap-1.5">
          {[1, 2, 3].map((_, index) => (
            <div
              key={index}
              className="h-1.5 flex-1 rounded-full bg-rose-500/10 overflow-hidden"
            >
              <div
                className={cn(
                  'h-full bg-linear-to-r from-gray-500 to-rose-600 animate-pulse',
                  index === 0 ? 'w-full' : 'w-0'
                )}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="h-full overflow-y-auto pt-16 pb-24 no-scrollbar">
        <div className="px-4 sm:px-6 flex flex-col gap-6">
          <div className="flex flex-col gap-2 sticky top-0 pt-2 pb-4 bg-background/80 backdrop-blur-xs z-10">
            <Skeleton className="h-10 sm:h-12 w-3/4 mx-auto bg-rose-500/10 rounded-lg" />
          </div>

          <div className="flex flex-col gap-3 sm:gap-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={`numbered-${index}`}
                className="relative bg-linear-to-br from-gray-500/[0.08] to-gray-600/[0.03] p-3 sm:p-4 rounded-2xl border border-gray-500/10"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <Skeleton className="h-8 w-8 rounded-full bg-rose-500/10 shrink-0" />
                  <Skeleton className="h-6 w-full bg-rose-500/10 rounded-md" />
                </div>
              </div>
            ))}

            {[1, 2].map((_, index) => (
              <div
                key={`emoji-${index}`}
                className="relative bg-linear-to-br from-gray-200/[0.08] to-gray-400/[0.03] p-3 sm:p-4 rounded-2xl border border-gray-500/10"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-6 w-6 rounded-full bg-rose-500/10 shrink-0" />
                  <Skeleton className="h-6 w-full bg-rose-500/10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-background/80 backdrop-blur-xs border-t border-rose-500/10">
        <div className="flex justify-between items-center">
          <Skeleton className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-rose-500/50 to-rose-600/50" />
          <div className="flex gap-2">
            {[1, 2, 3].map((_, index) => (
              <Skeleton
                key={index}
                className="h-2 w-2 rounded-full bg-rose-500/20"
              />
            ))}
          </div>
          <Skeleton className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-br from-rose-500/50 to-rose-600/50" />
        </div>
      </div>
    </Card>
  );
}
