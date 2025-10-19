import { cn } from "@/lib/utils";
import Link from "next/link";

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}
export default function NavLink(
    { href, children, className }: NavLinkProps
){
    return (
        <Link 
        href={href}
        className={cn(
            "transition-colors text-sm duration-200 text-gray-600 hover:text-rose-500" ,
            className
        )}
        >
        {children}
        </Link>
    )
}