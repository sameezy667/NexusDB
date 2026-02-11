/**
 * @file page.tsx
 * @description Highly animated landing page for Whiteboard Architect with premium backgrounds.
 * @module frontend/app
 */

"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Image as ImageIcon, Code2, Database, Zap, ArrowRight, Layers, MousePointer2, Upload, FileCode } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import Lottie from "lottie-react";

// AI Analysis Lottie JSON URL (High-reliability CDN)
const AI_ANALYSIS_LOTTIE = "https://assets10.lottiefiles.com/packages/lf20_vnikbeve.json";

export default function Dashboard() {
    const containerRef = useRef(null);
    const [lottieData, setLottieData] = useState<any>(null);

    // Fetch Lottie JSON
    useEffect(() => {
        fetch(AI_ANALYSIS_LOTTIE)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load animation");
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Response is not JSON");
                }
                return res.json();
            })
            .then(data => setLottieData(data))
            .catch(err => {
                console.warn("Lottie load failed:", err.message);
                setLottieData(null);
            });
    }, []);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring" as const,
                stiffness: 100,
                damping: 20
            }
        }
    };

    return (
        <div ref={containerRef} className="flex-1 relative flex flex-col items-center bg-mesh min-h-screen overflow-x-hidden scroll-smooth font-sans">
            {/* Background Texture Layers */}
            <div className="fixed inset-0 grid-pattern z-[1]"></div>
            <div className="fixed inset-0 noise-overlay z-[2]"></div>

            {/* Random Moving Purple Blob */}
            <div className="fixed inset-0 pointer-events-none z-[3] overflow-hidden">
                <motion.div
                    animate={{
                        x: [0, 300, -200, 400, -100, 0],
                        y: [0, 200, -150, 50, -250, 0],
                        scale: [1, 1.2, 0.8, 1.1, 0.9, 1],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-[30%] left-[30%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[140px] opacity-70"
                ></motion.div>
            </div>

            {/* Hero Content */}
            <motion.div
                style={{ y: y1, opacity }}
                className="w-full max-w-7xl z-10 flex flex-col items-center pt-32 pb-48 px-6 text-center"
            >
                {/* Floating Status Badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="group cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 mb-10 hover:border-primary/50 hover:bg-white/[0.06] transition-all backdrop-blur-xl shadow-2xl shadow-primary/20"
                >
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-gray-300 group-hover:text-white transition-colors uppercase tracking-[0.2em]">Next-Gen Architectural Intelligence</span>
                </motion.div>

                {/* Typography (UNCHANGED as requested) */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex flex-col items-center"
                >
                    <h1 className="text-7xl md:text-9xl font-black text-white tracking-[-0.08em] leading-[0.85] mb-2 uppercase">
                        From Sketch
                    </h1>
                    <h1 className="text-7xl md:text-9xl font-black text-gray-500/80 tracking-[-0.08em] leading-[0.85] uppercase">
                        to SQL.
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="text-gray-400 max-w-2xl mt-12 mb-12 text-lg md:text-xl font-light leading-relaxed tracking-tight"
                >
                    The first production-ready engine that converts hand-drawn entity relationships into structured PostgreSQL schemas. Stop manually coding, start architecting.
                </motion.p>

                {/* Floating Tech Chips */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="flex flex-wrap justify-center gap-3 mb-10"
                >
                    {["PostgreSQL", "Gemini 1.5 Flash", "React Flow", "Next.js 15", "TypeScript"].map((tech, i) => (
                        <motion.span
                            key={tech}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, y: [0, -5, 0] }}
                            transition={{
                                scale: { delay: 1 + i * 0.1 },
                                opacity: { delay: 1 + i * 0.1 },
                                y: { duration: 3, repeat: Infinity, delay: i * 0.2 }
                            }}
                            className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 uppercase tracking-widest hover:border-primary/50 hover:bg-white/10 transition-colors"
                        >
                            {tech}
                        </motion.span>
                    ))}
                </motion.div>

                {/* Primary Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="flex flex-col sm:flex-row gap-6 items-center"
                >
                    <Link href="/whiteboard">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            className="group relative px-10 py-5 bg-primary rounded-2xl font-bold text-white shadow-[0_0_40px_-10px_rgba(139,92,246,0.6)] flex items-center gap-3 overflow-hidden"
                        >
                            <Zap className="w-5 h-5 fill-white animate-pulse" />
                            Launch Architect
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </motion.button>
                    </Link>
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        className="px-10 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold text-white backdrop-blur-md transition-all flex items-center gap-3 group"
                    >
                        GitHub <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0], y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-32 flex flex-col items-center gap-2"
                >
                    <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600 font-bold">Scroll to Explore</span>
                    <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent"></div>
                </motion.div>
            </motion.div>

            {/* Feature Showcase Grid */}
            <div className="w-full max-w-7xl z-10 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 mb-40">
                {[
                    {
                        title: "Vision Analysis",
                        desc: "Proprietary OCR model trained specifically on developer handwriting and schema notations. Recognizes tables, columns, and types directly from whiteboard snapshots.",
                        icon: ImageIcon,
                        color: "primary"
                    },
                    {
                        title: "Auto-Relational",
                        desc: "Intelligent detection of PK/FK constraints based on spatial lines and naming heuristics. Automatically links related entities with interactive edges.",
                        icon: Database,
                        color: "blue-500"
                    },
                    {
                        title: "DDL Export",
                        desc: "Instant export to high-performance SQL scripts including indexes and constraints. Validated against modern PostgreSQL standards for immediate deployment.",
                        icon: Code2,
                        color: "accent"
                    }
                ].map((feature, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.2 }}
                        whileHover={{ y: -10, scale: 1.02 }}
                        className="minimal-card rounded-2xl p-10 bg-white/[0.02] border border-white/5 hover:border-primary/50 transition-all group relative overflow-hidden h-full flex flex-col"
                    >
                        <div className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 border border-${feature.color}/20 flex items-center justify-center text-${feature.color} mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                            <feature.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{feature.title}</h3>
                        <p className="text-gray-500 leading-relaxed font-light text-sm flex-1">{feature.desc}</p>

                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest font-bold">Details</span>
                            <ArrowRight className="w-4 h-4 text-gray-700 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                        </div>

                        {/* Decorative corner accent */}
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${feature.color}/10 blur-3xl rounded-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700`}></div>
                    </motion.div>
                ))}
            </div>

            {/* AI Flow Visualization Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="w-full max-w-7xl z-10 px-6 py-40 flex flex-col items-center"
            >
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4"
                    >
                        How it Works
                    </motion.h2>
                    <p className="text-gray-500 font-light">From a physical drawing to a digital database in three steps.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full relative">
                    {/* Connection Line */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-12"></div>

                    {[
                        { step: "01", title: "Upload Sketch", desc: "Snap a photo of your whiteboard session or upload a wireframe.", icon: Upload },
                        { step: "02", title: "AI Analysis", desc: "Gemini 1.5 Flash extracts entities and maps complex relationships.", icon: Sparkles },
                        { step: "03", title: "Instant DDL", desc: "Get production-ready SQL and an interactive diagram in clicks.", icon: FileCode }
                    ].map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="flex flex-col items-center text-center group"
                        >
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                className="w-24 h-24 rounded-3xl bg-[#0A0A0C] border border-white/5 flex items-center justify-center mb-8 relative group-hover:border-primary/50 transition-all shadow-2xl overflow-hidden"
                            >
                                <span className="absolute -top-3 -right-3 text-[10px] font-mono font-bold bg-primary text-white px-2 py-1 rounded italic z-10">{step.step}</span>
                                {step.step === "02" && lottieData ? (
                                    <div className="w-20 h-20 opacity-80 scale-150">
                                        <Lottie
                                            animationData={lottieData}
                                            loop={true}
                                        />
                                    </div>
                                ) : (
                                    <step.icon className="w-10 h-10 text-gray-500 group-hover:text-primary transition-colors" />
                                )}
                            </motion.div>
                            <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* Interactive "Technical" Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="w-full max-w-6xl z-10 px-6 py-40 flex flex-col lg:flex-row gap-20 items-center border-t border-white/5"
            >
                <div className="flex-1 space-y-8">
                    <motion.div
                        whileInView={{ x: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-mono text-primary font-bold uppercase tracking-widest"
                    >
                        <Layers className="w-3.5 h-3.5" /> Core Technology
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-tight"
                    >
                        Built for the speed of <br />
                        <span className="text-gray-500">whiteboard sessions.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-400 text-lg leading-relaxed max-w-lg font-light"
                    >
                        Architecting doesn't happen in a silo. We've bridge the gap between creative chalk-talk sessions and cold, hard implementation.
                    </motion.p>

                    <div className="grid grid-cols-2 gap-10 pt-8">
                        <div>
                            <div className="text-4xl font-bold text-white tracking-tighter flex items-center gap-2">
                                <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>~</motion.span>3s
                            </div>
                            <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-1">Extraction Latency</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white tracking-tighter">99.8%</div>
                            <div className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-1">Model Accuracy</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative w-full lg:w-auto">
                    {/* Meaningful Sketch-to-Relational Visualization */}
                    <motion.div
                        initial={{ rotateY: 10, rotateX: 5, scale: 0.95 }}
                        whileInView={{ rotateY: 20, rotateX: 10, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="aspect-[4/3] w-full max-w-lg mx-auto rounded-3xl overflow-hidden border border-white/10 bg-[#050505] shadow-2xl relative group"
                    >
                        {/* Background: Digital Relational Layer */}
                        <div className="absolute inset-0 p-8 flex flex-col gap-6 opacity-40">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <Database className="w-5 h-5 text-primary" />
                                <span className="text-xs font-mono text-gray-400 font-bold uppercase tracking-widest">Digital Twin</span>
                            </div>
                            <div className="space-y-3">
                                {["USERS.ID", "USERS.EMAIL", "USERS.HASH", "POSTS.ID", "POSTS.USER_ID"].map((field) => (
                                    <div key={field} className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                                        <span>{field}</span>
                                        <span className="text-[8px] opacity-50">VARCHAR(255)</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Foreground: Hand-drawn "Sketch" Layer */}
                        <motion.div
                            className="absolute inset-0 bg-[#0A0A0C] p-8 z-10"
                            animate={{
                                clipPath: [
                                    "inset(0% 0% 0% 0%)",
                                    "inset(100% 0% 0% 0%)",
                                    "inset(0% 0% 0% 0%)"
                                ]
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        >
                            <div className="w-full h-full border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-4 bg-white/[0.02]">
                                <div className="p-4 rounded-full bg-white/5">
                                    <ImageIcon className="w-10 h-10 text-gray-600" />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">Raw Whiteboard Input</p>
                                    <div className="flex gap-1 justify-center">
                                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-1 bg-gray-700/50 rounded-full"></div>)}
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* The Scanner Line */}
                        <motion.div
                            animate={{ top: ["0%", "100%", "0%"] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent z-20 shadow-[0_0_20px_rgba(139,92,246,1)]"
                        ></motion.div>

                        {/* Floating Cursor/AI Agent */}
                        <motion.div
                            animate={{
                                x: [50, 300, 150, 50],
                                y: [100, 250, 100, 100]
                            }}
                            transition={{ duration: 8, repeat: Infinity }}
                            className="absolute z-30 text-white flex items-center gap-2"
                        >
                            <Sparkles className="w-5 h-5 text-primary fill-primary animate-pulse" />
                            <div className="px-2 py-1 bg-primary rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-xl">
                                Analyzing...
                            </div>
                        </motion.div>

                        {/* SQL Snippet Reveal */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="absolute bottom-6 right-6 p-4 rounded-xl bg-black border border-white/10 z-20 shadow-2xl max-w-[200px]"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-[8px] font-mono text-gray-400 font-bold uppercase">SQL Generated</span>
                            </div>
                            <code className="text-[9px] text-primary/80 leading-tight block font-mono">
                                CREATE TABLE users (<br />
                                &nbsp;&nbsp;id UUID PRIMARY KEY,<br />
                                &nbsp;&nbsp;email TEXT UNIQUE<br />
                                );
                            </code>
                        </motion.div>
                    </motion.div>

                    {/* Decorative Background Circles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-primary/10 rounded-full blur-[120px] -z-10"></div>
                </div>
            </motion.section>

            {/* Footer / CTA Section */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="w-full z-10 px-6 pb-20 pt-10 text-center"
            >
                <div className="max-w-4xl mx-auto rounded-3xl bg-white/[0.02] border border-white/5 p-16 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                    <h2 className="text-4xl font-bold text-white mb-6 tracking-tight relative z-10">Ready to visualize?</h2>
                    <p className="text-gray-500 mb-10 max-w-lg mx-auto relative z-10 font-light">Join the elite architects who use vision to automate their development workflow.</p>
                    <Link href="/whiteboard">
                        <button className="px-10 py-5 bg-white text-black rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all relative z-10">
                            Get Started Free
                        </button>
                    </Link>
                </div>

                <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-xs">WA</div>
                        <span className="text-sm font-mono font-bold text-white">Whiteboard <span className="text-primary">Architect</span></span>
                    </div>
                    <div className="flex gap-8 text-[10px] uppercase font-mono tracking-widest text-gray-500">
                        <a href="#" className="hover:text-white transition-colors">Documentation</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Github</a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
