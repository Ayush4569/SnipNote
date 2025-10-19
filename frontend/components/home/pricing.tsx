import { cn } from "@/lib/utils";
import { ArrowRight, CheckLineIcon } from "lucide-react";
import Link from "next/link";

type Plan = {
    id: string,
    name: string,
    price: number,
    description: string,
    features: string[]
}
const plans: Plan[] = [
    {
        id: "basic",
        name: "Basic",
        price: 795,
        description: "For individuals for occasional use",
        features: [
            "5 PDF summaries per month",
            "Standard processing",
            "Email support"
        ]
    },
    {
        id: "pro",
        name: "Pro",
        price: 1600,
        description: "For professionals and teams",
        features: [
            "Unlimited PDF summaries",
            "Priority processing",
            "24/7 Support",
            "Markdown export"
        ]
    }
]

export default function Pricing() {
    return (
        <section className="overflow-hidden relative" id="pricing">
            <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 lg:pt-12">
                <div className="w-full flex items-center justify-center pb-12">
                    <h2 className="uppercase font-bold text-xl mb-8 text-rose-500">Pricing</h2>
                </div>
                <div className="relative flex flex-col justify-center items-center lg:flex-row lg:items-stretch gap-8">
                    {
                        plans.map((plan, index) => {
                            return <PlanCard key={plan.id} {...plan} />
                        })
                    }
                </div>
            </div>
        </section>
    );
}

function PlanCard(
    {
        id,
        name,
        price,
        description,
        features
    }: Plan
) {
    return (
        <div className="w-full relative max-w-lg hover:transtion-all hover:scale-105 duration-300">
            <div className={cn('relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 border-[1px] rounded-2xl border-gray-500/20 ',
                id === 'pro' && 'border-2 gap-5 border-rose-500 shadow-2xl shadow-rose-500/10'
            )}>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-lg lg:text-xl font-bold capitalize">{name}</p>
                        <p className="text-base-content/80 mt-2">{description}</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <p className="text-5xl tracking-tight font-extrabold">₹{price}</p>
                    <div className="flex flex-col justify-end mb-[4px]">
                        <p className="text-xs uppercase font-semibold">INR</p>
                        <p className="text-xs">/month</p>
                    </div>
                </div>

                <div className="space-y-2.5 text-base leading-relaxed flex-1">
                    {
                    features.map((feature) => 
                     (
                    <li key={feature} className="flex items-center gap-2">
                        <CheckLineIcon size={18}/>
                        <span>{feature}</span>
                        </li>
                        )
                        )
                    }
                </div>

                <div className="space-y-2 flex justify-center w-full">
                    <Link
                    href={''}
                    className={cn(
                        "w-full rounded-full flex items-center justify-center gap-2 bg-linear-to-r from-rose-800 to-rose-500 hover:from-rose-500 hover:to-rose-800 text-white border-2 py-2",
                        id === 'pro' ? 'border-rose-900' : 'border-rose-100 from-rose-400 to-rose-500'
                    )}
                    >
                        Buy Plan 
                        <ArrowRight size={18} />
                    </Link>
                </div>

            </div>
        </div>
    )
}