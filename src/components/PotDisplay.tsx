import React from 'react';

interface PotDisplayProps {
    pot: number;
    stage?: string;
}

export function PotDisplay({ pot, stage }: PotDisplayProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-1 z-0">
            {stage && (
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">
                    {stage}
                </span>
            )}
            <div className="relative group">
                {/* Removed ambient glow as per user request */}
                <div className="relative glass-panel bg-yellow-100/10 border-yellow-100/30 px-8 py-3 rounded-full flex flex-col items-center min-w-[140px] shadow-[0_0_15px_rgba(255,255,200,0.1)]">
                    <span className="text-[10px] text-yellow-100/90 font-bold uppercase tracking-widest mb-1">Total Pot</span>
                    <span className="font-display text-2xl font-bold text-white glow-text-gold tabular-nums">
                        {pot.toLocaleString()}
                    </span>
                </div>
            </div>

        </div>
    );
}
