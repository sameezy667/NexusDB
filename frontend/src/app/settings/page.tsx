/**
 * @file page.tsx
 * @description Simplified application settings page for AI configuration and project preferences.
 * @module frontend/app/settings
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Key, Cpu, Trash2, ShieldAlert, Check, Copy } from "lucide-react";

function Toggle({ checked, onChange }: { checked?: boolean, onChange?: () => void }) {
    return (
        <div
            onClick={onChange}
            className={`w-10 h-5 rounded-full p-0.5 flex transition-colors cursor-pointer ${checked ? 'bg-primary' : 'bg-gray-700'}`}
        >
            <motion.div
                animate={{ x: checked ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                className="h-4 w-4 rounded-full bg-white shadow-sm"
            ></motion.div>
        </div>
    )
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [debugLogging, setDebugLogging] = useState(true);
    const [copied, setCopied] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const item = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 }
    };

    return (
        <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full relative font-sans">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Workspace Settings</h1>
                <p className="text-sm text-gray-500 mb-8 border-b border-white/5 pb-6">
                    Configure your <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-primary">Whiteboard Architect</span> instance.
                </p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-8 mb-8">
                <motion.aside
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full md:w-56 shrink-0"
                >
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab("general")}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${activeTab === 'general' ? 'text-white bg-white/10 shadow-lg shadow-black/20 text-primary border-l-2 border-primary' : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'}`}
                        >
                            <Settings className="w-4 h-4" /> General
                        </button>
                        <button
                            onClick={() => setActiveTab("ai")}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${activeTab === 'ai' ? 'text-white bg-white/10 shadow-lg shadow-black/20 text-primary border-l-2 border-primary' : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'}`}
                        >
                            <Cpu className="w-4 h-4" /> AI Configuration
                        </button>
                        <button
                            onClick={() => setActiveTab("keys")}
                            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${activeTab === 'keys' ? 'text-white bg-white/10 shadow-lg shadow-black/20 text-primary border-l-2 border-primary' : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'}`}
                        >
                            <Key className="w-4 h-4" /> API Keys
                        </button>
                    </nav>
                </motion.aside>

                <motion.div
                    key={activeTab}
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="flex-1 space-y-10"
                >
                    {activeTab === "general" && (
                        <>
                            {/* General Config */}
                            <motion.section variants={item}>
                                <h2 className="text-lg font-semibold text-white mb-6">General Configuration</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2 tracking-widest">Instance Name</label>
                                        <input type="text" className="w-full bg-[#111113] border border-white/5 rounded-lg px-4 py-2.5 text-white text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 focus:outline-none transition-all" defaultValue="Whiteboard Pro" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-mono text-gray-500 uppercase mb-2 tracking-widest">Deployment ID</label>
                                        <div className="flex">
                                            <input type="text" className="w-full bg-[#0A0A0C] border border-white/5 rounded-l-lg px-4 py-2.5 text-gray-500 text-sm font-mono" defaultValue="wa_v1_8x92m" readOnly />
                                            <button
                                                onClick={() => copyToClipboard("wa_v1_8x92m")}
                                                className="px-4 border border-l-0 border-white/5 bg-white/5 rounded-r-lg hover:bg-white/10 transition-colors text-gray-400"
                                            >
                                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 bg-white/[0.02] border border-white/5 rounded-xl p-6">
                                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                        <div>
                                            <h3 className="text-sm font-medium text-white">Maintenance Mode</h3>
                                            <p className="text-xs text-gray-500 mt-1 max-w-sm">Disable new generations and show a maintenance splash.</p>
                                        </div>
                                        <Toggle checked={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-white">Advanced Debugging</h3>
                                            <p className="text-xs text-gray-500 mt-1 max-w-sm">Log internal AI prompts and responses to the console.</p>
                                        </div>
                                        <Toggle checked={debugLogging} onChange={() => setDebugLogging(!debugLogging)} />
                                    </div>
                                </div>
                            </motion.section>

                            <motion.section variants={item} className="border border-red-500/20 bg-red-500/5 rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-red-500 mb-6 flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5" />
                                    Danger Zone
                                </h2>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium text-white">Purge System Cache</h3>
                                        <p className="text-xs text-gray-500 mt-1">Clear all temporary image assets and generation history.</p>
                                    </div>
                                    <button className="px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-all flex items-center gap-2">
                                        <Trash2 className="w-3.5 h-3.5" /> Purge Cache
                                    </button>
                                </div>
                            </motion.section>
                        </>
                    )}

                    {activeTab === "ai" && (
                        <motion.section variants={item}>
                            <h2 className="text-lg font-semibold text-white mb-6 font-sans">AI Model Configuration</h2>
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-3 tracking-widest">Active Model</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border border-primary bg-primary/5 rounded-xl p-4 flex flex-col gap-2 cursor-pointer shadow-lg shadow-primary/10 transition-all">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-white">Gemini 1.5 Flash</span>
                                                <span className="text-[9px] px-2 py-0.5 bg-primary/20 text-primary rounded-full font-bold uppercase">Optimal</span>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed">Fastest inference, lower cost, excellent for schema layout extraction.</p>
                                        </div>
                                        <div className="border border-white/5 bg-[#0A0A0C] rounded-xl p-4 flex flex-col gap-2 cursor-pointer hover:border-white/20 transition-all opacity-60">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-gray-300">Gemini 1.5 Pro</span>
                                                <span className="text-[9px] px-2 py-0.5 bg-white/5 text-gray-500 rounded-full font-bold uppercase">Premium</span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed">Higher reasoning, best for complex 100+ table ERDs.</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-mono text-gray-500 uppercase mb-3 tracking-widest">Extraction Temperature</label>
                                    <div className="px-2">
                                        <input type="range" className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" min="0" max="100" defaultValue="10" />
                                        <div className="flex justify-between mt-2 font-mono text-[9px] text-gray-600 uppercase">
                                            <span>Strict (Preserve Sketch)</span>
                                            <span>Creative (AI Logic)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    )}

                    {activeTab === "keys" && (
                        <motion.section variants={item}>
                            <h2 className="text-lg font-semibold text-white mb-4">API Security</h2>
                            <p className="text-sm text-gray-500 mb-8 max-w-2xl">
                                These keys grant access to your AI providers and external integrations. Keep them secure.
                            </p>

                            <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0A0A0C]">
                                <table className="w-full text-left text-xs font-mono">
                                    <thead className="bg-[#111113] border-b border-white/5 text-gray-500">
                                        <tr>
                                            <th className="px-6 py-3 uppercase tracking-wider">Service</th>
                                            <th className="px-6 py-3 uppercase tracking-wider">Key Reference</th>
                                            <th className="px-6 py-3 uppercase tracking-wider text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        <tr className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <span className="text-white font-medium">Google Gemini</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-500">GEMINI_API_KEY (Defined in .env)</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[10px] bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full border border-green-500/20 font-bold uppercase tracking-wider">Configured</span>
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-white/[0.02] transition-colors opacity-40">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                                <span className="text-white font-medium">AWS S3 (Exports)</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-500">S3_STORAGE_SECRET</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[10px] bg-gray-500/10 text-gray-500 px-2.5 py-1 rounded-full border border-gray-500/20 font-bold uppercase tracking-wider">Unset</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </motion.section>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
