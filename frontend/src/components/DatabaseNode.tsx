/**
 * @file DatabaseNode.tsx
 * @description Custom React Flow node for visualizing database tables.
 * @module frontend/components
 */

import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

export default function DatabaseNode({ data }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#18181b] border border-white/10 rounded-lg min-w-[200px] shadow-xl overflow-hidden hover:border-primary/50 transition-colors"
        >
            <div className="bg-primary/10 border-b border-primary/20 px-3 py-2 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/50"></div>
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider">{data.label}</h3>
            </div>
            <div className="p-3 space-y-1.5">
                {data.schema.columns.map((col: any) => (
                    <div key={col.name} className="flex items-center justify-between text-[11px] font-mono group">
                        <div className="flex items-center gap-1.5">
                            {col.is_primary_key && <span className="text-yellow-500 text-[9px]">PK</span>}
                            {col.is_foreign_key && <span className="text-blue-400 text-[9px]">FK</span>}
                            <span className="text-gray-300 group-hover:text-white transition-colors">{col.name}</span>
                        </div>
                        <span className="text-gray-500 group-hover:text-gray-400">{col.type}</span>
                    </div>
                ))}
            </div>
            <Handle type="target" position={Position.Left} className="!bg-primary !w-3 !h-3 !-ml-1.5" />
            <Handle type="source" position={Position.Right} className="!bg-primary !w-3 !h-3 !-mr-1.5" />
        </motion.div>
    );
}
