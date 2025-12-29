import { cn } from "@/lib/utils";

export default function BgGradient({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 -top-32 -z-10 transform-gpu overflow-hidden blur-2xl sm:-top-24"
    >
      <div
        style={{
          clipPath:
            'polygon(50% 0%, 65% 30%, 100% 40%, 75% 65%, 85% 100%, 50% 80%, 15% 100%, 25% 65%, 0% 40%, 35% 30%)',
        }}
        className={cn(
          "relative left-[calc(50%-10rem)] aspect-[1155/678] w-[34rem] -translate-x-1/2 rotate-[25deg] bg-gradient-to-br from-indigo-400 via-fuchsia-400 to-pink-400 opacity-25 shadow-xl sm:left-[calc(50%-28rem)] sm:w-[68rem]",
          className
        )}
      />
    </div>
  );
}