import { Calendar, ChevronLeft, Clock, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Link from "next/link";

export default function SummaryHeader({
  createdAt,
  readingTime,
  title,
}: {
  createdAt: Date;
  readingTime: number;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="secondary"
            className="px-4 py-1.5 text-sm bg-white/80 backdrop-blur-xs rounded-full shadow-xs"
          >
            <Sparkles className="h-4 w-4 mr-2 text-rose-500" />
            AI summary
          </Badge>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-rose-400" />
            {new Date(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-rose-400" />
            {readingTime} min read
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
          <span className="bg-linear-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
            {title}
          </span>
        </h1>
      </div>

      <div className="self-start">
        <Link href="/dashboard">
          <Button
            variant="link"
            size="sm"
            className="group flex items-center gap-2 bg-rose-100 px-3 py-1.5 rounded-full shadow-xs hover:bg-white/80"
          >
            <ChevronLeft className="h-4 w-4 text-rose-500 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm text-muted-foreground font-medium">
              Back to Dashboard
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
