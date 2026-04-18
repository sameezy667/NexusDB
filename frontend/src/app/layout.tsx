import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
// import Sidebar from "@/components/Sidebar"; // Replaced by Navbar
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata = {
  title: "NexusDB",
  description: "Serverless Database for Modern Apps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen w-full bg-[#020202] text-sm antialiased selection:bg-primary/30 selection:text-white overflow-x-hidden`}>
        {/* Global Background Glow */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-[800px] h-[800px] bg-purple-900/5 rounded-full blur-[150px]"></div>
          <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-blue-900/5 rounded-full blur-[150px]"></div>
        </div>

        <Navbar />

        {/* Main Content Wrapper - Adjusted for Top Nav */}
        <main className="relative z-10 pt-16 min-h-screen flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
