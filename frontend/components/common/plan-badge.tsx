import { Crown } from "lucide-react"

export function PlanBadge({ isPro }: { isPro: boolean }) {
  return isPro ? (
    <span
      className="
        group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-lg
        bg-gradient-to-br from-amber-100 via-amber-200 to-yellow-200
        border border-amber-300/50
        text-amber-900 font-semibold text-xs
        shadow-[0_2px_8px_-2px_rgba(245,158,11,0.3)]
        transition-all duration-300 ease-in-out
        hover:shadow-[0_4px_12px_-2px_rgba(245,158,11,0.4)] hover:scale-105
        cursor-default select-none overflow-hidden
      "
      title="Pro Plan"
    >
      <div className="absolute inset-0 bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-700 relative z-10" />
      <span className="tracking-wide relative z-10">PRO</span>
    </span>
  ) : (
    <span
      className="
      inline-flex items-center gap-1.5 px-4 py-1 rounded-lg
      bg-rose-50 border border-rose-200
      text-rose-700 font-medium text-xs
      shadow-sm transition-all duration-200
      hover:bg-rose-100 hover:border-rose-300 hover:shadow-md
      cursor-default select-none
    "
      title="Free Plan"
    >

      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
      <span className="tracking-wide">Free</span>
    </span>
  )
}
