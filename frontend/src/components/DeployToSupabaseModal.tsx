"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CloudUpload, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface DeployToSupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  sqlCode: string;
  apiUrl: string;
}

export default function DeployToSupabaseModal({
  isOpen,
  onClose,
  sqlCode,
  apiUrl,
}: DeployToSupabaseModalProps) {
  const [projectRef, setProjectRef] = useState("");
  const [serviceKey, setServiceKey] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [deployedTables, setDeployedTables] = useState<string[]>([]);

  const handleDeploy = async () => {
    if (!projectRef.trim() || !serviceKey.trim()) {
      setDeployStatus("error");
      setMessage("Please fill in all fields");
      return;
    }

    setIsDeploying(true);
    setDeployStatus("idle");
    setMessage("");

    try {
      const response = await fetch(`${apiUrl}/deploy/supabase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectRef: projectRef.trim(),
          serviceKey: serviceKey.trim(),
          sql: sqlCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Deployment failed");
      }

      setDeployStatus("success");
      setMessage(data.message);
      setDeployedTables(data.tables || []);
    } catch (error: any) {
      setDeployStatus("error");
      setMessage(error.message || "An unexpected error occurred");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleClose = () => {
    if (!isDeploying) {
      setProjectRef("");
      setServiceKey("");
      setDeployStatus("idle");
      setMessage("");
      setDeployedTables([]);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[210] flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="supabase-modal-title"
          >
            <div className="w-full max-w-lg bg-[#0F0F11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A0A0C]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#3ecf8e]/20 flex items-center justify-center">
                    <CloudUpload className="w-5 h-5 text-[#3ecf8e]" />
                  </div>
                  <h2 id="supabase-modal-title" className="text-lg font-bold text-white">
                    Deploy to Supabase
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isDeploying}
                  className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Project Reference Input */}
                <div>
                  <label htmlFor="projectRef" className="block text-sm font-medium text-gray-300 mb-2">
                    Project Reference ID
                  </label>
                  <input
                    id="projectRef"
                    type="text"
                    value={projectRef}
                    onChange={(e) => setProjectRef(e.target.value)}
                    placeholder="abcdefghijklmnop"
                    disabled={isDeploying || deployStatus === "success"}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                    aria-describedby="projectRef-help"
                  />
                  <p id="projectRef-help" className="mt-1.5 text-xs text-gray-500">
                    Found in Supabase Dashboard → Settings → General
                  </p>
                </div>

                {/* Service Key Input */}
                <div>
                  <label htmlFor="serviceKey" className="block text-sm font-medium text-gray-300 mb-2">
                    Service Role Key
                  </label>
                  <input
                    id="serviceKey"
                    type="password"
                    value={serviceKey}
                    onChange={(e) => setServiceKey(e.target.value)}
                    placeholder="eyJ..."
                    disabled={isDeploying || deployStatus === "success"}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                    aria-describedby="serviceKey-help"
                  />
                  <p id="serviceKey-help" className="mt-1.5 text-xs text-gray-500">
                    Found in Supabase Dashboard → Settings → API (secret key)
                  </p>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-200">
                    Your credentials are transmitted over HTTPS and never stored or logged by NEXUS_DB
                  </p>
                </div>

                {/* Status Messages */}
                <AnimatePresence mode="wait">
                  {deployStatus === "success" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-200 mb-2">{message}</p>
                          {deployedTables.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {deployedTables.map((table) => (
                                <span
                                  key={table}
                                  className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-mono rounded border border-green-500/30"
                                >
                                  {table}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {deployStatus === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200">{message}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 bg-[#0A0A0C] flex items-center justify-between gap-3">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-[#3ecf8e] transition-colors flex items-center gap-1"
                >
                  Open Supabase Dashboard
                  <ExternalLink className="w-3 h-3" />
                </a>
                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={isDeploying}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deployStatus === "success" ? "Close" : "Cancel"}
                  </button>
                  {deployStatus !== "success" && (
                    <button
                      onClick={handleDeploy}
                      disabled={isDeploying || !projectRef.trim() || !serviceKey.trim()}
                      className="px-4 py-2 bg-[#3ecf8e] hover:bg-[#3ecf8e]/90 rounded-lg text-sm font-semibold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#3ecf8e]/20"
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-4 h-4" />
                          Deploy Schema
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
