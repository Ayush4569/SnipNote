'use client';
import { FileText } from "lucide-react";
import NavLink from "./nav-link";
import { useAuth } from "@/context/auth.context";
import Image from "next/image";
import { AvatarDropDown } from "./avatar-dropdown";
import { Skeleton } from "../ui/skeleton";
import { PlanBadge } from "./plan-badge";

export default function Header() {
    const { user, status } = useAuth()

    return (
        <nav className="flex items-center justify-between px-2 container py-4 lg:px-8 mx-auto">

            <div className="lg:flex-1 flex">
                <NavLink href='/' className="flex items-center gap-1 lg:gap-2 shrink-0">
                    <FileText className="w-9 h-9 lg:w-8 lg:h-8 hover:rotate-12 transform transition duration-200 ease-in-out text-gray-900" />
                    <span className="font-extrabold text-2xl text-gray-900 lg:text-xl">
                        Snipnote
                    </span>
                </NavLink>
            </div>

            <div className="hidden sm:flex lg:justify-center gap-4 lg:gap-12 lg:items-center">
                <NavLink href='/#pricing' className="text-base"> Pricing </NavLink>
                {
                    status === 'authenticated' &&
                    <NavLink href='/dashboard' className="text-base">
                        Your summaries
                    </NavLink>
                }
            </div>

            <div className="flex lg:justify-end lg:flex-1">
                {status === "loading" && (
                    <Skeleton className="h-11 w-11 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                )}
                {status !== "loading" && status === "unauthenticated" && (
                    <NavLink href='/auth/login' className="text-xl sm:text-base"> Log in </NavLink>
                )}
                {status === "authenticated" && (
                    <div className="flex items-center gap-x-4">

                        <span className="hidden sm:inline">
                            <PlanBadge isPro={!!user?.isPro} />
                        </span>
                        <AvatarDropDown>
                            <Image
                                src={user?.picture || '/user-avatar.png'}
                                alt='User Avatar'
                                height={50}
                                width={50}
                                priority
                                style={{ height: 50, width: 50 }}
                                className='object-cover'
                            />
                        </AvatarDropDown>
                    </div>
                )}
            </div>

        </nav>
    )
}


