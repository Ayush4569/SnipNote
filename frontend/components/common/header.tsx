'use client';
import { FileText } from "lucide-react";
import NavLink from "./nav-link";
import { useAuth } from "@/context/auth.context";
import Image from "next/image";
import { AvatarDropDown } from "./avatar-dropdown";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";

export default function Header() {
    const { status, user } = useAuth()

    return (
        <nav className="flex items-center justify-between px-2 container py-4 lg:px-8 mx-auto">

            <div className="lg:flex-1 flex">
                <NavLink href='/' className="flex items-center gap-1 lg:gap-2 shrink-0">
                    <FileText className="w-5 h-5 lg:w-8 lg:h-8 hover:rotate-12 transform transition duration-200 ease-in-out text-gray-900" />
                    <span className="font-extrabold text-gray-900 lg:text-xl">
                        Snipnote
                    </span>
                </NavLink>
            </div>

            <div className="flex lg:justify-center gap-4 lg:gap-12 lg:items-center">
                <NavLink href='/#pricing'> Pricing </NavLink>
                {status === 'authenticated' && <NavLink href='/dashboard'> Your summaries </NavLink>}
            </div>

            <div className="flex lg:justify-end lg:flex-1">
                {status === "loading" && (
            <div className="flex gap-2 animate-out">
              <Skeleton className="h-9 w-28 bg-neutral-200 dark:bg-neutral-700" />
            </div>
          )}
          {status !== "loading" && status === "unauthenticated" && (
            <Button asChild className="cursor-pointer">
              <NavLink href='/login'> Log in </NavLink>
            </Button>
          )}
          {status === "authenticated" && user?.id && (
            <AvatarDropDown>
              <Image
                src={user.picture || '/user-avatar.png'}
                alt='User Avatar'
                height={40}
                width={40}
                style={{ height: 50, width: 50 }}
                className='object-cover'
              />
            </AvatarDropDown>
          )}
            </div>

        </nav>
    )
}


