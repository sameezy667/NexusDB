"use client";

import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  Node,
  Edge,
  ConnectionMode
} from 'reactflow';
import 'reactflow/dist/style.css';
import Editor from '@monaco-editor/react';
import { Upload, FileCode, Maximize, RefreshCw, Loader2, Plus, Sparkles, AlertCircle, X, History, Trash2, Download, Database, ChevronDown, CloudUpload, Copy } from 'lucide-react';
import DatabaseNode from '@/components/DatabaseNode';
import DeployToSupabaseModal from '@/components/DeployToSupabaseModal';
import DeployToFirebaseModal from '@/components/DeployToFirebaseModal';
import DialectSelector, { DIALECT_BACKEND_MAP } from '@/components/DialectSelector';
import ValidationPanel from '@/components/ValidationPanel';
import NodeEditModal from '@/components/NodeEditModal';
import MigrationGenerator from '@/components/MigrationGenerator';
import { motion, AnimatePresence } from "framer-motion";
import { generateSQL, Schema } from '@/lib/generateSQL';
import { downloadSQL } from '@/lib/downloadSQL';

const nodeTypes = {
  databaseNode: DatabaseNode,
};

// NOTE: API calls now go through Next.js server-side Route Handlers
// at /api/generate and /api/generate-data (same-origin relative URLs).
// The Route Handlers proxy to BACKEND_API_URL at runtime on the server.

interface HistoryItem {
  id: string;
  timestamp: number;
  sqlCode: string;
  nodes: Node[];
  edges: Edge[];
  name: string;
}

export default function WhiteboardPage() {
  // State
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [sqlCode, setSqlCode] = useState<string>("-- Upload a schema sketch to generate SQL...");
  const [isUploading, setIsUploading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dialect, setDialect] = useState<string>("postgresql");
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState(false);
  const [rawSchema, setRawSchema] = useState<any>(null);
  const [editingNode, setEditingNode] = useState<{ id: string; schema: any } | null>(null);
  const [editedNodes, setEditedNodes] = useState<Set<string>>(new Set());
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('schema_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history to localStorage
  const updateHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem('schema_history', JSON.stringify(newHistory));
  };

  // React Flow Handlers
  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setHasGenerated(false);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    // Map frontend dialect to backend-supported dialect
    const backendDialect = DIALECT_BACKEND_MAP[dialect] || "postgresql";
    formData.append("dialect", backendDialect);

    try {
      // Use a relative URL — the Next.js Route Handler at /api/generate
      // proxies to the backend server-side, so CORS and absolute URLs
      // are not a concern here.
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON Response:", text);
        console.log("Full response text for debugging:", text); // Added detailed log
        throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
      }

      if (!res.ok) {
        throw new Error(data?.details || data?.message || `Error ${res.status}: ${data?.error || res.statusText}`);
      }

      // Update State
      setNodes(data.graph_data.nodes);
      setEdges(data.graph_data.edges);
      
      // If dialect is not natively supported by backend, regenerate SQL on frontend
      const backendDialect = DIALECT_BACKEND_MAP[dialect] || "postgresql";
      if (dialect !== backendDialect && data.raw_schema) {
        const regeneratedSQL = generateSQL(data.raw_schema, dialect);
        setSqlCode(regeneratedSQL);
      } else {
        setSqlCode(data.sql_code);
      }
      
      setRawSchema(data.raw_schema);
      setHasGenerated(true);
      setEditedNodes(new Set()); // Reset edited nodes on new generation

    } catch (err: any) {
      console.error(err);
      // Better error message for connection issues
      if (err.message.includes("fetch") || err.message.includes("NetworkError") || err.name === "TypeError") {
        setError("Cannot connect to the backend server. Please ensure the backend is running and BACKEND_API_URL is correctly set in Vercel.");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Save Schema Handler
  const saveCurrentSchema = () => {
    if (!hasGenerated) {
      setError("Generate a schema first before saving.");
      return;
    }

    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      sqlCode,
      nodes,
      edges,
      name: `Schema ${new Date().toLocaleString()}`
    };

    const newHistory = [newItem, ...history];
    updateHistory(newHistory);

    setSuccessMessage("Schema saved to history!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setNodes(item.nodes);
    setEdges(item.edges);
    setSqlCode(item.sqlCode);
    setHasGenerated(true);
    setShowHistory(false);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter(item => item.id !== id);
    updateHistory(newHistory);
  };

  const handleGenerateMockData = async () => {
    if (!hasGenerated || !sqlCode) return;
    setIsGeneratingData(true);
    try {
      const backendDialect = DIALECT_BACKEND_MAP[dialect] || "postgresql";
      const res = await fetch("/api/generate-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql_code: sqlCode, dialect: backendDialect, count: 10 })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed (${res.status}): ${text.slice(0, 200)}`);
      }

      const data = await res.json();

      setSqlCode(prev => prev + "\n\n-- Mock Data\n" + data.sql_code);
      setSuccessMessage("Mock data generated!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to generate data");
    } finally {
      setIsGeneratingData(false);
    }
  };

  // Handle node double-click for editing
  const handleNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (node.data?.schema) {
      setEditingNode({ id: node.id, schema: node.data.schema });
    }
  }, []);

  // Handle saving edited node
  const handleSaveNodeEdit = useCallback((updatedSchema: any) => {
    if (!editingNode) return;

    // Update the node in React Flow
    setNodes((nds) =>
      nds.map((node) =>
        node.id === editingNode.id
          ? { ...node, data: { ...node.data, label: updatedSchema.name, schema: updatedSchema } }
          : node
      )
    );

    // Mark node as edited
    setEditedNodes((prev) => new Set(prev).add(editingNode.id));

    // Update rawSchema
    if (rawSchema) {
      const updatedTables = rawSchema.tables.map((table: any) =>
        table.name === editingNode.schema.name ? updatedSchema : table
      );
      const newSchema = { ...rawSchema, tables: updatedTables };
      setRawSchema(newSchema);

      // Regenerate SQL from updated schema
      const newSQL = generateSQL(newSchema, dialect);
      setSqlCode(newSQL);
    }

    setEditingNode(null);
  }, [editingNode, rawSchema, dialect]);

  // Download SQL handler
  const handleDownloadSQL = () => {
    downloadSQL(sqlCode, dialect);
    setDownloadMessage("Downloaded!");
    setTimeout(() => setDownloadMessage(null), 2000);
  };

  // Copy SQL to clipboard
  const handleCopySQL = async () => {
    try {
      await navigator.clipboard.writeText(sqlCode);
      setSuccessMessage("SQL copied to clipboard!");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  return (
    <div className="flex-1 h-[calc(100vh-4rem)] overflow-hidden relative flex flex-col p-6 font-sans">

      {/* Notifications */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-20 left-1/2 z-[100] bg-red-500/10 border border-red-500/50 backdrop-blur-md px-4 py-3 rounded-lg flex items-center gap-3 shadow-2xl shadow-red-500/20"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-200">{error}</span>
            <button onClick={() => setError(null)} className="ml-2 p-1 hover:bg-red-500/20 rounded-full transition-colors">
              <X className="w-4 h-4 text-red-500" />
            </button>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -50, x: "-50%" }}
            className="fixed top-20 left-1/2 z-[100] bg-green-500/10 border border-green-500/50 backdrop-blur-md px-4 py-3 rounded-lg flex items-center gap-3 shadow-2xl shadow-green-500/20"
          >
            <Plus className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-200">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar: History Panel */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[#0F0F11] border-l border-white/10 z-[120] p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <History className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Schema History</h2>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                    <History className="w-12 h-12 mb-4" />
                    <p className="text-sm">No saved schemas yet</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => loadFromHistory(item)}
                      className="group p-4 bg-white/5 border border-white/5 hover:border-primary/50 rounded-xl cursor-pointer transition-all relative"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white text-sm truncate max-w-[180px]">{item.name}</h3>
                        <button
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-500 rounded-md transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 mb-3 font-mono">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {item.nodes.length} Tables
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                          SQL Generated
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Title & Actions */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sticky top-0 z-10"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1 flex items-center gap-2">
            Whiteboard Architect <Sparkles className="w-4 h-4 text-primary" />
          </h1>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Sketch-to-SQL Engine</p>
        </div>
        <div className="flex items-center gap-3">
          <DialectSelector value={dialect} onChange={setDialect} />
          <button
            onClick={() => setShowHistory(true)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-medium text-white transition-colors flex items-center gap-2"
          >
            <History className="w-3.5 h-3.5 text-primary" /> History
          </button>
          <button
            onClick={() => {
              setHasGenerated(false);
              setNodes([]);
              setEdges([]);
              setSqlCode("-- Upload a schema sketch to generate SQL...");
            }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-xs font-medium text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset View
          </button>
          <button
            onClick={saveCurrentSchema}
            className={`px-4 py-2 rounded-md text-xs font-semibold text-white transition-all flex items-center gap-2 shadow-lg shadow-primary/20 ${hasGenerated ? 'glow-button' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'}`}
          >
            <Plus className="w-3.5 h-3.5" /> Save Schema
          </button>
        </div>
      </motion.div>

      {/* Main Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0"
      >

        {/* Left Panel: Visual Diagram */}
        <div className="minimal-card rounded-lg flex flex-col relative overflow-hidden h-full group border border-white/5 bg-[#0F0F11]">
          {isUploading && (
            <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary/50" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mt-6">Analyzing Sketch...</h2>
              <div className="flex gap-1 mt-4">
                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-primary"></motion.div>
                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary"></motion.div>
                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary"></motion.div>
              </div>
            </div>
          )}

          <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0A0A0C]">
            <div className="flex items-center gap-2">
              <Maximize className="w-4 h-4 text-gray-500" />
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">Entity Relationship Diagram</span>
            </div>
            {hasGenerated && (
              <span className="text-[9px] px-1.5 py-0.5 rounded border border-green-500/30 bg-green-500/10 text-green-400 uppercase font-mono">Live Diagram</span>
            )}
          </div>

          <div className="flex-1 bg-[#050505] relative w-full h-full min-h-[400px]">
            {!hasGenerated ? (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <label className="group cursor-pointer w-full max-w-md">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-white/10 group-hover:border-primary/50 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col items-center justify-center gap-6 p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center group-hover:text-primary group-hover:bg-primary/20 transition-all text-gray-400 ring-1 ring-white/10 group-hover:ring-primary/40 group-hover:rotate-3">
                      <Upload className="w-9 h-9" />
                    </div>
                    <div className="text-center px-4 relative z-10">
                      <h3 className="text-xl font-bold text-white mb-2">Drop Whiteboard Photo</h3>
                      <p className="text-sm text-gray-500 mb-6">Support for hand-drawn schemas and digital wireframes</p>
                      <span className="px-4 py-2 bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest rounded-full border border-primary/40 shadow-lg shadow-primary/10">Process with AI</span>
                    </div>
                  </div>
                </label>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDoubleClick={handleNodeDoubleClick}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
                className="bg-[#050505]"
              >
                <Background color="#1f1f23" gap={20} size={1} />
                <Controls className="!bg-[#18181b] !border-white/10 [&>button]:!fill-gray-400 hover:[&>button]:!fill-white !rounded-lg !shadow-2xl" />
              </ReactFlow>
            )}
          </div>
        </div>

        {/* Right Panel: SQL Editor */}
        <div className="minimal-card rounded-lg flex flex-col h-full overflow-hidden border border-white/5 bg-[#0F0F11]">
          <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0A0A0C]">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">Generated DDL Source</span>
            </div>
            <div className="flex items-center gap-2">
              {hasGenerated && (
                <>
                  <button
                    onClick={handleCopySQL}
                    className="text-[9px] px-2 py-1 rounded border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors uppercase font-mono flex items-center gap-1"
                    title="Copy SQL"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={handleDownloadSQL}
                      className="text-[9px] px-2 py-1 rounded border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors uppercase font-mono flex items-center gap-1"
                      title="Download SQL"
                    >
                      <Download className="w-3 h-3" />
                      SQL
                    </button>
                    <AnimatePresence>
                      {downloadMessage && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-full mt-1 right-0 px-2 py-1 bg-green-500/20 border border-green-500/40 rounded text-[9px] text-green-300 whitespace-nowrap"
                        >
                          {downloadMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
              <button
                onClick={handleGenerateMockData}
                disabled={!hasGenerated || isGeneratingData}
                className="text-[9px] px-2 py-1 rounded border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors uppercase font-mono flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingData ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
                Mock Data
              </button>
              <span className="text-[9px] px-1.5 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary uppercase font-mono shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                {dialect.toUpperCase()}
              </span>
            </div>
          </div>
          
          {/* Validation Panel */}
          {hasGenerated && (
            <div className="px-4 py-3 border-b border-white/5 bg-[#0A0A0C]">
              <ValidationPanel schema={rawSchema} />
            </div>
          )}

          {/* Export / Deploy Section */}
          {hasGenerated && (
            <div className="px-4 py-3 border-b border-white/5 bg-[#0A0A0C]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Export / Deploy</span>
                <div className="flex items-center gap-2">
                  <MigrationGenerator currentSchema={rawSchema} dialect={dialect} apiUrl="" />
                  <button
                    onClick={() => setShowSupabaseModal(true)}
                    className="text-[9px] px-2.5 py-1.5 rounded-md border border-[#3ecf8e]/30 bg-[#3ecf8e]/10 text-[#3ecf8e] hover:bg-[#3ecf8e]/20 transition-colors uppercase font-mono flex items-center gap-1.5"
                    aria-label="Deploy to Supabase"
                  >
                    <CloudUpload className="w-3 h-3" />
                    Supabase
                  </button>
                  <button
                    onClick={() => setShowFirebaseModal(true)}
                    className="text-[9px] px-2.5 py-1.5 rounded-md border border-[#FFA000]/30 bg-[#FFA000]/10 text-[#FFA000] hover:bg-[#FFA000]/20 transition-colors uppercase font-mono flex items-center gap-1.5"
                    aria-label="Deploy to Firebase"
                  >
                    <CloudUpload className="w-3 h-3" />
                    Firebase
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex-1 bg-[#050505] relative pt-2">
            <Editor
              height="100%"
              defaultLanguage="sql"
              value={sqlCode}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                fontFamily: "JetBrains Mono, ui-monospace, monospace",
                padding: { top: 20, bottom: 20 },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                scrollbar: {
                  vertical: 'hidden',
                  horizontal: 'hidden'
                }
              }}
            />
          </div>
        </div>

      </motion.div>

      {/* Deployment Modals */}
      <DeployToSupabaseModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
        sqlCode={sqlCode}
        apiUrl=""
      />
      <DeployToFirebaseModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
        schema={rawSchema}
        apiUrl=""
      />

      {/* Node Edit Modal */}
      {editingNode && (
        <NodeEditModal
          isOpen={!!editingNode}
          onClose={() => setEditingNode(null)}
          tableSchema={editingNode.schema}
          onSave={handleSaveNodeEdit}
          position={{ x: 0, y: 0 }}
        />
      )}
    </div>
  );
}
