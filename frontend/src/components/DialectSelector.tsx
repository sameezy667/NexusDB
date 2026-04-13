"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Database } from "lucide-react";

// Map frontend dialect slugs to backend-supported dialects
export const DIALECT_BACKEND_MAP: Record<string, string> = {
  // SQL dialects - direct mapping
  postgresql: "postgresql",
  mysql: "mysql",
  sqlite: "sqlite",
  mssql: "mssql",
  oracle: "postgresql", // Backend doesn't support Oracle, use PostgreSQL
  cockroachdb: "postgresql", // CockroachDB is PostgreSQL-compatible
  planetscale: "mysql", // PlanetScale is MySQL-compatible
  
  // NoSQL dialects - map to PostgreSQL for backend processing
  mongodb: "postgresql",
  firestore: "postgresql",
  cassandra: "postgresql",
  dynamodb: "postgresql",
  
  // Mobile/Embedded - map to SQLite
  watermelondb: "sqlite",
  "sqlite-mobile": "sqlite",
  
  // Key-Value - map to PostgreSQL
  redis: "postgresql",
};

interface DialectOption {
  value: string;
  label: string;
  color: string;
  type: "sql" | "nosql" | "mobile" | "keyvalue";
}

interface DialectGroup {
  label: string;
  options: DialectOption[];
}

const DIALECT_GROUPS: DialectGroup[] = [
  {
    label: "RELATIONAL (SQL)",
    options: [
      { value: "postgresql", label: "PostgreSQL", color: "#3b82f6", type: "sql" },
      { value: "mysql", label: "MySQL", color: "#3b82f6", type: "sql" },
      { value: "sqlite", label: "SQLite", color: "#3b82f6", type: "sql" },
      { value: "mssql", label: "Microsoft SQL Server", color: "#3b82f6", type: "sql" },
      { value: "oracle", label: "Oracle Database", color: "#3b82f6", type: "sql" },
      { value: "cockroachdb", label: "CockroachDB", color: "#3b82f6", type: "sql" },
      { value: "planetscale", label: "PlanetScale", color: "#3b82f6", type: "sql" },
    ],
  },
  {
    label: "DOCUMENT (NoSQL)",
    options: [
      { value: "mongodb", label: "MongoDB", color: "#f97316", type: "nosql" },
      { value: "firestore", label: "Firebase Firestore", color: "#f97316", type: "nosql" },
    ],
  },
  {
    label: "WIDE-COLUMN",
    options: [
      { value: "cassandra", label: "Apache Cassandra", color: "#f97316", type: "nosql" },
      { value: "dynamodb", label: "Amazon DynamoDB", color: "#f97316", type: "nosql" },
    ],
  },
  {
    label: "MOBILE / EMBEDDED",
    options: [
      { value: "watermelondb", label: "WatermelonDB", color: "#06b6d4", type: "mobile" },
      { value: "sqlite-mobile", label: "SQLite (Mobile)", color: "#06b6d4", type: "mobile" },
    ],
  },
  {
    label: "KEY-VALUE",
    options: [
      { value: "redis", label: "Redis (Schema Hints)", color: "#f97316", type: "keyvalue" },
    ],
  },
];

interface DialectSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function DialectSelector({ value, onChange, disabled = false }: DialectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the selected option
  const selectedOption = DIALECT_GROUPS.flatMap((g) => g.options).find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 rounded-md py-2 pl-3 pr-8 text-xs font-medium text-white transition-colors focus:outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] text-left flex items-center gap-2"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedOption && (
          <>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedOption.color }}
            />
            <span className="flex-1 truncate">{selectedOption.label}</span>
          </>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 w-64 bg-[#18181b] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
            role="listbox"
          >
            {DIALECT_GROUPS.map((group, groupIndex) => (
              <div key={group.label}>
                {/* Group Header */}
                <div className="px-3 py-2 text-[10px] font-mono text-gray-500 uppercase tracking-wider bg-white/[0.02] italic pointer-events-none select-none">
                  {group.label}
                </div>

                {/* Group Options */}
                {group.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-3 py-2.5 text-left text-xs font-medium transition-colors flex items-center gap-2.5 ${
                      value === option.value
                        ? "bg-primary/10 text-primary"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                    role="option"
                    aria-selected={value === option.value}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: option.color }}
                    />
                    <span className="flex-1">{option.label}</span>
                    {value === option.value && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                ))}

                {/* Divider between groups (except last) */}
                {groupIndex < DIALECT_GROUPS.length - 1 && (
                  <div className="h-px bg-white/5 my-1" />
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
