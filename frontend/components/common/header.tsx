'use client';
import { FileText } from "lucide-react";
import NavLink from "./nav-link";
import { useAuth } from "@/context/auth.context";
import Image from "next/image";
import { AvatarDropDown } from "./avatar-dropdown";
import { Skeleton } from "../ui/skeleton";

export default function Header() {
    const { user,status } = useAuth()
      console.log('status in header:', status);
      
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
              <Skeleton className="h-11 w-11 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          )}
          {status !== "loading" && status === "unauthenticated" && (
              <NavLink href='/login'> Log in </NavLink>
          )}
          {status === "authenticated" && user?.id && (
            <AvatarDropDown>
              <Image
                src={user.picture || '/user-avatar.png'}
                alt='User Avatar'
                height={40}
                width={40}
                style={{ height: 40, width: 40 }}
                className='object-cover'
              />
            </AvatarDropDown>
          )}
            </div>

        </nav>
    )
}


