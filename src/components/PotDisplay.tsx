import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pot } from '@/lib/poker/types';

interface PotDisplayProps {
    pots: Pot[];
    totalPot: number;
}

export function PotDisplay({ pots, totalPot }: PotDisplayProps) {
    return (
        <div className="flex flex-col items-center justify-center">
            <AnimatePresence>
                {totalPot > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/40 shadow-lg"
                    >
                        <span className="text-yellow-400 font-bold text-sm tracking-wide">
                            POT: <span className="font-mono">{totalPot.toLocaleString()}</span>
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
