import { BrainCircuit, FileOutput, FileText, MoveDown, MoveRight } from "lucide-react";
import { MotionDiv, MotionH2, MotionH3 } from "../common/motion-helpers";

interface Steps {
    title: string;
    description: string;
    icon: React.ReactNode;
}

const steps: Steps[] = [
    {
        title: 'Upload your PDF',
        description: 'Easily upload your PDF document through our user-friendly interface.',
        icon: <FileText size={64} strokeWidth={2} className="text-indigo-400 drop-shadow-lg" />
    },
    {
        title: 'AI-Powered Summarization',
        description: 'Let our advanced AI analyze and summarize your document in seconds.',
        icon: <BrainCircuit size={64} strokeWidth={2} className="text-fuchsia-400 drop-shadow-lg" />
    },
    {
        title: 'Get Your Summary',
        description: 'Receive a concise summary, ready to use or share instantly.',
        icon: <FileOutput size={64} strokeWidth={2} className="text-pink-400 drop-shadow-lg" />
    },
];

export default function WorkingGuide() {
    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <MotionH2 className="text-3xl font-extrabold font-mono text-center text-indigo-900 mb-10 tracking-tight">
                How It Works
            </MotionH2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {steps.map((step, idx) => (
                    <MotionDiv
                        key={step.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className="flex flex-col items-center bg-white/90 rounded-2xl shadow-lg p-6 border border-indigo-100
                        w-full lg:w-[260px] lg:p-4 lg:h-[260px]"
                    >
                        <div className="mb-4">{step.icon}</div>
                        <h3 className="font-bold text-lg text-fuchsia-700 mb-2 font-sans">{step.title}</h3>
                        <p className="text-gray-700 font-light text-base">{step.description}</p>
                        {idx < steps.length - 1 && (
                            <>
                            <MoveRight className="hidden md:block mt-6 text-indigo-300 w-6 h-6 animate-bounce" />
                            <MoveDown className="md:hidden block mt-6 text-indigo-300 w-6 h-6 animate-bounce" />

                            </>
                        )}
                    </MotionDiv>
                ))}
            </div>
        </section>
    );
}