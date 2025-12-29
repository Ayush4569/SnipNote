'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { queryClient } from '@/lib/tanstack'
import { useQuery } from '@tanstack/react-query'
import { User } from '@/types/user'
import axios from 'axios'

const MAX_WAIT_TIME = 60000
const REFRESH_INTERVAL = 2000

export default function VerifyingPaymentPage() {
  const router = useRouter()

  const [timedOut, setTimedOut] = useState(false)
  const [startTime] = useState(Date.now())

  const { data: user, refetch, isFetching } = useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`,
          {
              withCredentials: true,
          }
      );
      return res.data.user as User;
  },
    refetchInterval: ({state}) => {
      if (state.data?.isPro) return false
      return REFRESH_INTERVAL
    },
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (user?.isPro) {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      router.replace('/dashboard')
    }
  }, [user?.isPro, queryClient, router])

  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() - startTime > MAX_WAIT_TIME) {
        setTimedOut(true)
      }
    }, 500)

    return () => clearInterval(timer)
  }, [startTime])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-rose-50 to-white px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-rose-100 p-8 text-center space-y-6">
        {!timedOut && (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-10 w-10 text-rose-500 animate-spin" />
            </div>

            <h1 className="text-xl font-semibold">
              Verifying your payment
            </h1>

            <p className="text-sm text-muted-foreground">
              This usually takes a few seconds. Please don’t close this page.
            </p>
          </>
        )}

        {timedOut && !user?.isPro && (
          <>
            <div className="flex justify-center">
              <AlertTriangle className="h-10 w-10 text-amber-500" />
            </div>

            <h1 className="text-xl font-semibold">
              Still verifying your payment
            </h1>

            <p className="text-sm text-muted-foreground">
              Sometimes banks take a little longer. Your payment is safe.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setTimedOut(false)
                  refetch()
                }}
                disabled={isFetching}
              >
                Retry verification
              </Button>

              <Button
                onClick={() => router.replace('/dashboard')}
              >
                Go to dashboard
              </Button>
            </div>
          </>
        )}

        {user?.isPro && (
          <>
            <div className="flex justify-center">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>

            <h1 className="text-xl font-semibold">
              Payment verified
            </h1>

            <p className="text-sm text-muted-foreground">
              Redirecting you to your dashboard…
            </p>
          </>
        )}
      </div>
    </div>
  )
}
