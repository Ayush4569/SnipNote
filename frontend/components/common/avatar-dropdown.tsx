'use client'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth.context"
import axios, { AxiosError } from "axios"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import NavLink from "./nav-link"
import { PlanBadge } from "./plan-badge"

export function AvatarDropDown({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth()
  const router = useRouter()

  const handleLogOut = async () => {
    try {
      const url = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000/api").replace(/\/+$/, "");
      await axios.post(`${url}/auth/logout`, null, {
        withCredentials: true
      });
      toast.success("Logged out successfully.");
    } catch (error) {
      console.error("Failed to logout on server:", error);
    } finally {
      logout();
      router.push("/auth/login");
    }
  }
  return (
    <DropdownMenu >
      <DropdownMenuTrigger className="group relative cursor-pointer rounded-full ring-2 ring-transparent transition-all duration-200 hover:ring-yellow-600 focus:outline-none" asChild>
        <div className="overflow-hidden rounded-full">
          {children}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56 border-[color:var(--border)] shadow-lg backdrop-blur-sm"
        style={{ background: 'var(--surface)' }}
        align="end"
        sideOffset={8}

      >
        
        <DropdownMenuLabel className="text-[color:var(--text)] font-semibold flex items-center justify-between gap-2 px-3 py-2">
          My Account
          <PlanBadge isPro={!!user?.isPro} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[color:var(--border)]" />

        <DropdownMenuItem
          className="group cursor-pointer transition-all  duration-100 hover:bg-indigo-500/10 focus:bg-indigo-500/10"
          asChild
        >
          <NavLink href='/upload'  >
            Upload a PDF
          </NavLink>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[color:var(--border)]" />

        <DropdownMenuItem className="sm:hidden group cursor-pointer transition-all  duration-100 hover:bg-indigo-500/10 focus:bg-indigo-500/10" asChild>
          <NavLink href='/dashboard' >
            Dashboard
          </NavLink>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="sm:hidden bg-[color:var(--border)]" />

        <DropdownMenuItem className="group sm:hidden cursor-pointer transition-all  duration-100 hover:bg-indigo-500/10 focus:bg-indigo-500/10" asChild>
          <NavLink href='/#pricing' >
            Pricing
          </NavLink>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="sm:hidden not-only-of-type:bg-[color:var(--border)]" />

        <DropdownMenuItem className="p-1" asChild>
          <Button
            className="w-full text-white justify-start gap-2 sm:bg-red-600/10 sm:text-gray-500 border border-red-700/20 cursor-pointer"
            variant="ghost"
            onClick={handleLogOut}
          >
            <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:text-white" />
            Logout
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}