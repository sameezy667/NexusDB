"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, ChevronDown } from "lucide-react";
import { Schema } from "@/lib/generateSQL";

interface ValidationWarning {
  type: string;
  message: string;
}

interface ValidationPanelProps {
  schema: Schema | null;
}

export default function ValidationPanel({ schema }: ValidationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!schema || !schema.tables || schema.tables.length === 0) {
    return null;
  }

  const warnings = validateSchema(schema);
  const hasWarnings = warnings.length > 0;

  return (
    <div className="w-full">
      {/* Header Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${
          hasWarnings
            ? "bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10"
            : "bg-green-500/5 border-green-500/20 hover:bg-green-500/10"
        }`}
      >
        <div className="flex items-center gap-3">
          {hasWarnings ? (
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          ) : (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          <span className="text-sm font-medium text-white">
            {hasWarnings ? `⚠ ${warnings.length} Warning${warnings.length > 1 ? "s" : ""}` : "✓ Schema looks good"}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {hasWarnings ? (
                warnings.map((warning, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg flex items-start gap-3"
                  >
                    <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-yellow-200">{warning.message}</p>
                      <span className="text-[10px] text-yellow-500/60 font-mono uppercase mt-1 inline-block">
                        {warning.type}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-sm text-green-200">No validation issues detected. Your schema is ready to deploy!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Validate schema and return array of warnings
 */
function validateSchema(schema: Schema): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const tableNames = new Set<string>();
  const tableLookup = new Map<string, boolean>();

  // Build table lookup (case-insensitive)
  schema.tables.forEach((table) => {
    const lowerName = table.name.toLowerCase();
    if (tableLookup.has(lowerName)) {
      warnings.push({
        type: "DUPLICATE_TABLE",
        message: `Duplicate table name detected: '${table.name}'`,
      });
    }
    tableLookup.set(lowerName, true);
    tableNames.add(table.name);
  });

  // Validate each table
  schema.tables.forEach((table) => {
    // Check 1: No primary key
    const hasPrimaryKey = table.columns.some((col) => col.is_primary_key);
    if (!hasPrimaryKey) {
      warnings.push({
        type: "NO_PRIMARY_KEY",
        message: `Table '${table.name}' has no primary key`,
      });
    }

    // Check 2: Only one column
    if (table.columns.length === 1) {
      warnings.push({
        type: "SINGLE_COLUMN",
        message: `Table '${table.name}' has only one column — is this intentional?`,
      });
    }

    // Check 3: Sensitive tables with plain text passwords
    const sensitiveTableNames = ["users", "accounts", "profiles"];
    if (sensitiveTableNames.includes(table.name.toLowerCase())) {
      table.columns.forEach((col) => {
        const colNameLower = col.name.toLowerCase();
        const colTypeLower = col.type.toLowerCase();
        if (
          (colNameLower === "password" || colNameLower === "passwd") &&
          (colTypeLower.includes("varchar") || colTypeLower.includes("text") || colTypeLower.includes("string"))
        ) {
          warnings.push({
            type: "PLAIN_TEXT_PASSWORD",
            message: `Column '${col.name}' in '${table.name}' stores passwords as plain text — consider hashing`,
          });
        }
      });
    }

    // Check 4: Foreign key references non-existent table
    table.columns.forEach((col) => {
      if (col.is_foreign_key && col.foreign_key_target) {
        const [refTable] = col.foreign_key_target.split(".");
        if (!tableNames.has(refTable)) {
          warnings.push({
            type: "INVALID_FK_REFERENCE",
            message: `Column '${col.name}' in '${table.name}' references '${refTable}' but that table was not found`,
          });
        }
      }
    });

    // Check 5: Column named 'id' that is NOT a primary key
    table.columns.forEach((col) => {
      if (col.name.toLowerCase() === "id" && !col.is_primary_key) {
        warnings.push({
          type: "ID_NOT_PRIMARY_KEY",
          message: `Column 'id' in '${table.name}' is not marked as primary key`,
        });
      }
    });
  });

  return warnings;
}
