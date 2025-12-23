'use client'
import { cn } from "@/lib/utils";
import { ArrowRight, CheckLineIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { toast } from "sonner";
import axios, { AxiosError, isAxiosError } from "axios";
import { useAuth } from "@/context/auth.context";
import { queryClient } from "@/lib/tanstack";

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
        price: 0,
        description: "For individuals trial use",
        features: [
            "5 PDF summaries per month",
            "Max PDF size 10MB",
            "Max 10 pages per PDF"
        ]
    },
    {
        id: "pro",
        name: "Pro",
        price: 399,
        description: "For frequent users",
        features: [
            "20 PDF summaries per month",
            "Max PDF size 30MB",
            "Max 30 pages per PDF",
            "24/7 Support",
        ]
    }
]
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };
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
    const [loading, setLoading] = useState<boolean>(false);
    const {user} = useAuth()
    const handleSubscribe = async () => {
        
        if(!user) {
          toast.error("You must be logged in to subscribe");
          return;
        }
        setLoading(true);
        try {
          const isLoaded = await loadRazorpayScript();
          if (!isLoaded) {
            toast.error("Failed to load Razorpay SDK");
            setLoading(false);
            return;
          }
    
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/subscriptions`,
            null,
            {
              withCredentials: true,
            }
          );
    
          const options = {
            key: data.keyId,
            subscription_id: data.subscriptionId,
            name: "Snipnote Pro",
            description: "Get more AI summaries",
            theme: { color: "#6366F1" },
            handler: function () {
              toast.success("Subscription successfull!");
              window.location.href = "/?subscribed=true";
            },
            modal: {
              ondismiss: async function () {
                await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/subscriptions/cancel`, {
                  withCredentials: true,
                });
              },
            },
            prefill: {
              email: user?.email,
              name:user?.name
            },
          };
    
          const razorpay = new window.Razorpay(options)
    
          razorpay.open();
        } catch (error) {
          console.error("Error subscribing:", error);
          if (isAxiosError(error)) {
            toast.error(error.response?.data.message);
          } else {
            toast.error("unexpected error ");
          }
        } finally {
          setLoading(false);
        }
    }
    const cancelSubscription = async()=>{
        try {
           await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/payment/subscriptions/cancel`,{
            withCredentials:true
          })
          toast.success("Subscription cancelled")
          queryClient.invalidateQueries({queryKey:['user']})
        } catch (error) {
          console.error("Error unsubscribing:", error);
          if (error instanceof AxiosError) {
            toast.error(error.response?.data.message);
          } else {
            toast.error("unexpected error ");
          }
        }
    }
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
                    <Button
                    onClick={id === 'pro' ? handleSubscribe : undefined}
                    className={cn(
                        "w-full rounded-full flex items-center justify-center gap-2 bg-linear-to-r from-rose-800 to-rose-500 hover:from-rose-500 hover:to-rose-800 text-white border-2 py-5",
                        id === 'pro' ? 'border-rose-900' : 'border-rose-100 from-rose-400 to-rose-500'
                    )}
                    >
                        {id === 'pro' ? 'Buy Plan' : 'Default Plan'}
                        {
                            id === 'pro' && <ArrowRight size={16} />
                        }
                    </Button>
                </div>

            </div>
        </div>
    )
}