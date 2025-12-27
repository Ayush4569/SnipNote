import { ExternalLink, FileText } from "lucide-react";
import { Button } from "../ui/button";
import DownloadSummaryButton from "./download-summary-button";
import { SummarySlide } from "@/types/summary";

export default function SourceInfo({
  fileName,
  originalFileUrl,
  summaryText,
  createdAt,
}: {
  createdAt: Date;
  summaryText: SummarySlide[];
  originalFileUrl: string;
  fileName: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="h-4 w-4 text-rose-400 shrink-0" />
        <span className="truncate">{fileName}</span>
      </div>

      <div className="flex flex-wrap gap-3 ">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          asChild
        >
          <a href={originalFileUrl} target="_blank" rel="noopener noreferrer" style={{paddingInline:0}}>
            <ExternalLink className="h-4 w-4 mr-1" />
            View Original
          </a>
        </Button>

        <DownloadSummaryButton
          summaryText={summaryText}
          title={fileName}
          fileName={fileName}
          createdAt={createdAt}
        />
      </div>
    </div>
  );
}