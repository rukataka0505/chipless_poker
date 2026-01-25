import React from 'react';
import { motion } from 'framer-motion';

interface BetDisplayProps {
    amount: number;
    label?: string; // Optional label (e.g., "Total Pot")
    className?: string;
}

export function BetDisplay({ amount, label, className = '' }: BetDisplayProps) {
    if (amount <= 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-white/10 shadow-md ${className}`}
        >
            {/* Simple Chip Icon - smaller */}
            <div className="relative w-3 h-3 rounded-full border border-dashed border-white/70 bg-red-600 shadow-sm flex-shrink-0" />

            {/* Amount & Label */}
            <div className="flex flex-col leading-none">
                {label && <span className="text-[8px] text-gray-300 font-medium">{label}</span>}
                <span className="text-white font-bold font-mono text-[10px] tracking-wide">
                    {amount.toLocaleString()}
                </span>
            </div>
        </motion.div>
    );
}
