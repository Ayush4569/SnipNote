'use client'

import { cn } from "@/lib/utils"
import { ArrowRight, CheckLineIcon, Loader2, Crown } from "lucide-react"
import { Button } from "../ui/button"
import { useState } from "react"
import { toast } from "sonner"
import axios, { isAxiosError, AxiosError } from "axios"
import { useAuth } from "@/context/auth.context"
import { queryClient } from "@/lib/tanstack"
import { Plan, containerVariants, itemVariants, plans } from "@/lib/constants"
import { MotionDiv, MotionSection } from "../common/motion-helpers"
import { User } from "@/types/user"

const listVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
}

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

export default function Pricing() {
  return (
    <MotionSection
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      id="pricing"
      className="relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <MotionDiv variants={itemVariants} className="text-center mb-12">
          <h2 className="uppercase font-bold text-xl text-rose-500">
            Pricing
          </h2>
        </MotionDiv>

        <div className="flex flex-col lg:flex-row gap-8 items-stretch justify-center">
          {plans.map((plan) => (
            <PlanCard key={plan.id} {...plan} />
          ))}
        </div>
      </div>
    </MotionSection>
  )
}

function PlanCard({ id, name, price, description, features }: Plan) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const isProPlan = id === "pro"
  const isCurrentPlan = isProPlan && user?.isPro

  const handleSubscribe = async () => {
    if (!user) {
      toast.error("You must be logged in to subscribe")
      return
    }

    setLoading(true)
    try {
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        toast.error("Failed to load Razorpay")
        return
      }

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/subscriptions`,
        null,
        { withCredentials: true }
      )

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Snipnote Pro",
        description: "Get more AI summaries",

        theme: { color: "#E11D48" },
        handler: () => {
          window.location.href = "/verifying-payment"
        },
        prefill: {
          email: user.email,
          name: user.name,
        },
      }

      const razorpay = new window.Razorpay(options)

      razorpay.open()
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message)
      } else {
        toast.error("Unexpected error")
      }
    } finally {
      setLoading(false)
    }
  }
  const cancelSubscription = async () => {
    try {
      queryClient.setQueryData(['user'], (oldUser: User) => {
        if (!oldUser) return oldUser
        return {
          ...oldUser,
          isPro: false,
        }
      })

      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/subscriptions/cancel`,
        { withCredentials: true }
      )

      if (data.success) {
        toast.success(data.message || "Subscription cancelled")
        queryClient.invalidateQueries({ queryKey: ['user'] })
      }
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['user'] })

      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message)
      } else {
        toast.error("Error unsubscribing")
      }
    }
  }

  return (
    <MotionDiv
      variants={listVariants}
      whileHover={{ scale: isCurrentPlan ? 1 : 1.03 }}
      className="w-full max-w-md mx-auto"
    >
      <div
        className={cn(
          "relative flex flex-col h-full gap-6 p-8 rounded-2xl border bg-white",
          isProPlan
            ? "border-rose-500 shadow-xl shadow-rose-500/10"
            : "border-gray-200"
        )}
      >
        {isCurrentPlan && (
          <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-100 px-3 py-1 rounded-full">
            <Crown size={14} />
            Current Plan
          </div>
        )}

        <div>
          <p className="text-xl font-bold">{name}</p>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>

        <div className="flex items-end gap-2">
          <p className="text-5xl font-extrabold">₹{price}</p>
          <div className="text-xs text-muted-foreground mb-1">
            <p>INR</p>
            <p>/month</p>
          </div>
        </div>

        <ul className="space-y-3 flex-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <CheckLineIcon size={18} className="text-rose-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4">
          {isCurrentPlan ? (
            <div className="w-full text-center bg-rose-100 text-rose-600 font-semibold" >
              <Button
                onClick={cancelSubscription}
                variant='default'
                className="w-full py-2 text-base">
                Cancel Subscription
              </Button>
            </div>
          ) : (
            <Button
              onClick={isProPlan ? handleSubscribe : undefined}
              disabled={loading || !isProPlan}
              className={cn(
                "w-full rounded-full py-5 flex items-center justify-center gap-2",
                isProPlan
                  ? "bg-linear-to-r from-rose-600 to-rose-500 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  {isProPlan ? "Upgrade to Pro" : "Free Plan"}
                  {isProPlan && <ArrowRight size={16} />}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </MotionDiv>
  )
}
