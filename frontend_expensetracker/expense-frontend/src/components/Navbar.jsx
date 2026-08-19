import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Expense", path: "/expense" },
    { label: "List", path: "/list" },
    { label: "Settings", path: "/settings" },
];

export default function Navbar() {
    return (
        <header className="border-b bg-background">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                
                {/* Logo */}
                <NavLink
                    to="/dashboard"
                    className="text-lg font-bold tracking-tight"
                >
                    Expense Tracker
                </NavLink>

                {/* Navigation */}
                <nav className="flex items-center gap-1">
                    {links.map((link) => (
                        <Button
                            key={link.path}
                            asChild
                            variant="ghost"
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