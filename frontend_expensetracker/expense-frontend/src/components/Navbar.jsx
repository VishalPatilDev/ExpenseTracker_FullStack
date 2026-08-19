import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HandCoins } from "lucide-react";


const links = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Expense", path: "/expense" },
    { label: "List", path: "/list" },
    { label: "Settings", path: "/settings" },
];

export default function Navbar() {
    return (
        <header className="border bg-background bg-blue-300">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                
                {/* Logo */}
                <NavLink
                    to="/dashboard"
                    className="  text-2xl font-semibold tracking-tight flex gap-2"
                >
                    <HandCoins className="mt-1"></HandCoins>
                    Expense Tracker
                </NavLink>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    {links.map((link) => (
                        <Button
                            key={link.path}
                            asChild
                            variant="ghost"
                            className='underline '
                        >
                            <NavLink
                                to={link.path}
                                className={({ isActive }) =>
                                    cn(
                                        "text-sm",
                                        isActive &&
                                            "bg-accent text-accent-foreground"
                                    )
                                }
                            >
                                {link.label}
                            </NavLink>
                        </Button>
                    ))}
                </nav>
            </div>
        </header>
    );
}