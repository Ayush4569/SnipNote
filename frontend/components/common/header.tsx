import { FileText } from "lucide-react";
import NavLink from "./nav-link";
import { Button } from "../ui/button";

export default function Header() {
    const isLoggedIn = false;

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
                {isLoggedIn && <NavLink href='/dashboard'> Your summaries </NavLink>}
            </div>

            <div className="flex lg:justify-end lg:flex-1">
                {
                    isLoggedIn ? (
                        <div>
                             <NavLink href='/upload'> Upload a PDF </NavLink>
                             <span>Pro</span>
                             <Button>User</Button>
                        </div>
                    ) : (
                        <div>
                            <NavLink href='/login' > Log In </NavLink>
                        </div>
                    )
                }
            </div>

        </nav>
    )
}


