"use client";

import { LayoutGrid, Database, Activity, ShieldCheck, Zap, Users, HardDrive, MoreVertical, Layers } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="w-64 bg-[#030303] border-r border-white/5 z-20 flex flex-col h-full flex-shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-primary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                    </div>
                    <span className="font-mono font-bold tracking-tight text-white">Nexus<span className="text-gray-600">DB</span></span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
                <div>
                    <h4 className="px-3 text-[10px] font-mono uppercase text-gray-600 mb-2 tracking-wider">Platform</h4>
                    <Link href="/" className={clsx("sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all cursor-pointer mb-1", isActive('/') ? "active text-white bg-primary/10 border border-primary/15" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent")}>
                        <LayoutGrid className="w-4 h-4" />
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/clusters" className={clsx("sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all cursor-pointer mb-1", isActive('/clusters') ? "active text-white bg-primary/10 border border-primary/15" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent")}>
                        <Database className="w-4 h-4" />
                        <span>Clusters</span>
                    </Link>
                    <Link href="/observability" className={clsx("sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all cursor-pointer mb-1", isActive('/observability') ? "active text-white bg-primary/10 border border-primary/15" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent")}>
                        <Activity className="w-4 h-4" />
                        <span>Observability</span>
                    </Link>
                    <Link href="/settings" className={clsx("sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all cursor-pointer mb-1", isActive('/settings') ? "active text-white bg-primary/10 border border-primary/15" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent")}>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Settings</span>
                    </Link>
                </div>
                <div>
                    <h4 className="px-3 text-[10px] font-mono uppercase text-gray-600 mb-2 tracking-wider">Tools</h4>
                    <Link href="/whiteboard" className={clsx("sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all cursor-pointer mb-1", isActive('/whiteboard') ? "active text-white bg-primary/10 border border-primary/15" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent")}>
                        <Layers className="w-4 h-4" />
                        <span>Schema Gen</span>
                    </Link>
                </div>
                <div>
                    <h4 className="px-3 text-[10px] font-mono uppercase text-gray-600 mb-2 tracking-wider">Features</h4>
                    <div className="sidebar-item hover:text-white hover:bg-white/5 text-gray-400 flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all cursor-pointer mb-1 border border-transparent">
                        <Zap className="w-4 h-4" />
                        <span>Edge Functions</span>
                    </div>
                    <div className="sidebar-item hover:text-white hover:bg-white/5 text-gray-400 flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all cursor-pointer mb-1 border border-transparent">
                        <Users className="w-4 h-4" />
                        <span>Auth</span>
                    </div>
                    <div className="sidebar-item hover:text-white hover:bg-white/5 text-gray-400 flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all cursor-pointer mb-1 border border-transparent">
                        <HardDrive className="w-4 h-4" />
                        <span>Storage</span>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-white/5">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-500 p-[1px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <span className="text-xs font-mono font-bold text-white">JD</span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">Jane Doe</p>
                        <p className="text-[10px] text-gray-500 truncate font-mono">jane@nexus.dev</p>
                    </div>
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                </div>
            </div>
        </aside>
    );
}
