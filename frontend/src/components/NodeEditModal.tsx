"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Save, Key, Link as LinkIcon } from "lucide-react";

interface Column {
  name: string;
  type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  foreign_key_target?: string;
}

interface TableSchema {
  name: string;
  columns: Column[];
}

interface NodeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableSchema: TableSchema;
  onSave: (updatedSchema: TableSchema) => void;
  position: { x: number; y: number };
}

export default function NodeEditModal({
  isOpen,
  onClose,
  tableSchema,
  onSave,
  position,
}: NodeEditModalProps) {
  const [editedSchema, setEditedSchema] = useState<TableSchema>(tableSchema);

  useEffect(() => {
    setEditedSchema(tableSchema);
  }, [tableSchema]);

  const handleTableNameChange = (newName: string) => {
    setEditedSchema({ ...editedSchema, name: newName });
  };

  const handleColumnChange = (index: number, field: keyof Column, value: any) => {
    const newColumns = [...editedSchema.columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setEditedSchema({ ...editedSchema, columns: newColumns });
  };

  const handleAddColumn = () => {
    const newColumn: Column = {
      name: "new_column",
      type: "VARCHAR(255)",
      is_primary_key: false,
      is_foreign_key: false,
      foreign_key_target: "",
    };
    setEditedSchema({ ...editedSchema, columns: [...editedSchema.columns, newColumn] });
  };

  const handleDeleteColumn = (index: number) => {
    const newColumns = editedSchema.columns.filter((_, i) => i !== index);
    setEditedSchema({ ...editedSchema, columns: newColumns });
  };

  const handleSave = () => {
    onSave(editedSchema);
    onClose();
  };

  const handleCancel = () => {
    setEditedSchema(tableSchema); // Reset to original
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onKeyDown={handleKeyDown}
            className="fixed inset-0 z-[310] flex items-center justify-center p-4"
          >
            <div className="bg-[#0F0F11] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0A0A0C]">
              <h3 className="text-lg font-bold text-white">Edit Table</h3>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto max-h-[60vh] space-y-5">
              {/* Table Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Table Name</label>
                <input
                  type="text"
                  value={editedSchema.name}
                  onChange={(e) => handleTableNameChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono text-sm"
                />
              </div>

              {/* Columns */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">Columns</label>
                  <button
                    onClick={handleAddColumn}
                    className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 border border-primary/40 rounded-md text-xs font-medium text-primary transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Column
                  </button>
                </div>

                <div className="space-y-3">
                  {editedSchema.columns.map((col, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-white/5 border border-white/10 rounded-lg space-y-2"
                    >
                      {/* Column Name & Type */}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={col.name}
                          onChange={(e) => handleColumnChange(idx, "name", e.target.value)}
                          placeholder="Column name"
                          className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono text-xs"
                        />
                        <input
                          type="text"
                          value={col.type}
                          onChange={(e) => handleColumnChange(idx, "type", e.target.value)}
                          placeholder="Type"
                          className="px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono text-xs"
                        />
                      </div>

                      {/* Flags & FK Target */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={col.is_primary_key}
                            onChange={(e) => handleColumnChange(idx, "is_primary_key", e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                          />
                          <Key className="w-3 h-3 text-yellow-500" />
                          <span>Primary Key</span>
                        </label>

                        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={col.is_foreign_key}
                            onChange={(e) => handleColumnChange(idx, "is_foreign_key", e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                          />
                          <LinkIcon className="w-3 h-3 text-blue-400" />
                          <span>Foreign Key</span>
                        </label>

                        {col.is_foreign_key && (
                          <input
                            type="text"
                            value={col.foreign_key_target || ""}
                            onChange={(e) => handleColumnChange(idx, "foreign_key_target", e.target.value)}
                            placeholder="table.column"
                            className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50 font-mono text-xs"
                          />
                        )}

                        <button
                          onClick={() => handleDeleteColumn(idx)}
                          className="ml-auto p-1.5 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                          title="Delete column"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 bg-[#0A0A0C] flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                <Save className="w-4 h-4" />
                Apply Changes
              </button>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
