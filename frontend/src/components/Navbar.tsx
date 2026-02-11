"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Layers } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Overview", href: "/" },
        { name: "Schema Gen", href: "/whiteboard", icon: Layers },
        { name: "Settings", href: "/settings" },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#020202]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 md:px-8">
            {/* Left: Brand & Nav */}
            <div className="flex items-center gap-10">
                {/* Brand */}
                <Link href="/" className="flex items-center gap-3 group">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 text-primary shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all"
                    >
                        <Layers className="w-5 h-5" />
                    </motion.div>
                    <div className="flex flex-col">
                        <span className="font-black tracking-tighter text-white text-base leading-none">Whiteboard</span>
                        <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest leading-none mt-1 group-hover:text-primary transition-colors">Architect</span>
                    </div>
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8 px-6 border-l border-white/5 h-8">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "relative text-[11px] uppercase font-bold tracking-widest transition-all hover:text-white flex items-center gap-2",
                                    isActive ? "text-white" : "text-gray-500"
                                )}
                            >
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute -bottom-[24px] left-[-2px] right-[-2px] h-[3px] bg-primary shadow-[0_0_15px_rgba(139,92,246,0.8)] rounded-t-full"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <Link href="#" className="hidden md:block text-xs font-medium text-gray-500 hover:text-white transition-colors">
                    Documentation
                </Link>
                <button className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-md text-xs font-bold transition-all transform hover:scale-105 active:scale-95">
                    Go to Dashboard
                </button>
            </div>
        </nav>
    );
}
