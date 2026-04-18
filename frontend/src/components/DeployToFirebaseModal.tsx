"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CloudUpload, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface DeployToFirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: any;
  apiUrl: string;
}

export default function DeployToFirebaseModal({
  isOpen,
  onClose,
  schema,
  apiUrl,
}: DeployToFirebaseModalProps) {
  const [serviceAccountJson, setServiceAccountJson] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [collections, setCollections] = useState<string[]>([]);
  const [jsonError, setJsonError] = useState("");

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setJsonError("");
      return;
    }

    try {
      JSON.parse(value);
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON format");
    }
  };

  const handleJsonChange = (value: string) => {
    setServiceAccountJson(value);
    validateJson(value);
  };

  const handleDeploy = async () => {
    if (!serviceAccountJson.trim()) {
      setDeployStatus("error");
      setMessage("Please paste your service account JSON");
      return;
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(serviceAccountJson);
    } catch {
      setDeployStatus("error");
      setMessage("Invalid JSON format. Please check your service account JSON");
      return;
    }

    setIsDeploying(true);
    setDeployStatus("idle");
    setMessage("");

    try {
      const response = await fetch(`/api/deploy/firebase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceAccount: parsedJson,
          schema: schema,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Deployment failed");
      }

      setDeployStatus("success");
      setMessage(`Successfully created ${data.collectionsCreated} collections`);
      setCollections(data.collections || []);
    } catch (error: any) {
      setDeployStatus("error");
      setMessage(error.message || "An unexpected error occurred");
    } finally {
      setIsDeploying(false);
    }
  };

  const handleClose = () => {
    if (!isDeploying) {
      setServiceAccountJson("");
      setDeployStatus("idle");
      setMessage("");
      setCollections([]);
      setJsonError("");
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
            aria-labelledby="firebase-modal-title"
          >
            <div className="w-full max-w-2xl bg-[#0F0F11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A0A0C]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FFA000]/20 flex items-center justify-center">
                    <CloudUpload className="w-5 h-5 text-[#FFA000]" />
                  </div>
                  <h2 id="firebase-modal-title" className="text-lg font-bold text-white">
                    Deploy to Firebase
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
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Service Account JSON Input */}
                <div>
                  <label htmlFor="serviceAccount" className="block text-sm font-medium text-gray-300 mb-2">
                    Service Account JSON
                  </label>
                  <textarea
                    id="serviceAccount"
                    value={serviceAccountJson}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    placeholder='{"type": "service_account", "project_id": "...", ...}'
                    disabled={isDeploying || deployStatus === "success"}
                    rows={12}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFA000]/50 focus:border-[#FFA000]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs resize-none"
                    aria-describedby="serviceAccount-help serviceAccount-error"
                  />
                  {jsonError && (
                    <p id="serviceAccount-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {jsonError}
                    </p>
                  )}
                  <p id="serviceAccount-help" className="mt-1.5 text-xs text-gray-500">
                    Go to Firebase Console → Project Settings → Service Accounts → Generate New Private Key → paste the downloaded JSON here
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
                          <p className="text-sm font-medium text-green-200 mb-3">{message}</p>
                          {collections.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {collections.map((collection) => (
                                <span
                                  key={collection}
                                  className="px-2.5 py-1.5 bg-[#FFA000]/20 text-[#FFA000] text-xs font-mono rounded-lg border border-[#FFA000]/30 flex items-center gap-1.5"
                                >
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFA000]"></div>
                                  {collection}
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
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-400 hover:text-[#FFA000] transition-colors flex items-center gap-1"
                >
                  Open Firebase Console
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
                      disabled={isDeploying || !serviceAccountJson.trim() || !!jsonError}
                      className="px-4 py-2 bg-[#FFA000] hover:bg-[#FFA000]/90 rounded-lg text-sm font-semibold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#FFA000]/20"
                    >
                      {isDeploying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-4 h-4" />
                          Deploy to Firestore
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
