import { BookOpenText } from "lucide-react";
import { MotionDiv, MotionH3 } from "../common/motion-helpers";
import SummaryViewer from "../summary/summary-viewer";
import { demoSummary } from "@/lib/constants";

function DemoSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="py-14 lg:py-28 max-w-5xl mx-auto px-5 sm:px-7 lg:px-10 lg:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 transform-gpu overflow-hidden blur-2xl"
        >
          <div
            className="relative left-[calc(50%+2rem)] aspect-[1155/678] w-[34rem] -translate-x-1/2 bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-pink-400 opacity-35 sm:left-[calc(50%+34rem)] sm:w-[70rem]"
            style={{
              clipPath:
                'polygon(70% 40%, 100% 60%, 95% 25%, 80% 0%, 75% 5%, 68% 30%, 60% 65%, 52% 70%, 48% 60%, 45% 35%, 30% 80%, 0% 65%, 20% 100%, 30% 80%, 80% 95%, 70% 40%)',
            }}
          />
        </div>
        <div className="flex flex-col items-center text-center space-y-5 w-full">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center p-3 rounded-3xl bg-white/80 backdrop-blur-sm border border-indigo-300/30 shadow-md mb-5"
          >
            <BookOpenText className="h-9 w-9 text-fuchsia-400" />
          </MotionDiv>
          <div className="text-center mb-16 px-2">
            <MotionH3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-extrabold text-3xl max-w-2xl mx-auto font-mono tracking-tight text-indigo-900"
            >
              Watch How Snipnote transforms{' '}
              <span className="bg-gradient-to-r from-fuchsia-500 to-indigo-600 bg-clip-text text-transparent font-sans">
                this React.js PDF
              </span>{' '}
              into an easy summary
            </MotionH3>
          </div>
          <div className="flex items-center justify-center w-full px-2 sm:px-4">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-2xl"
            >
              <SummaryViewer summaryText={demoSummary} />
            </MotionDiv>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DemoSection;