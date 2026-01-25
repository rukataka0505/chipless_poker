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
                <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full group-hover:bg-gold/30 transition-all duration-500" />
                <div className="relative glass-panel bg-black/40 border-gold/20 px-8 py-3 rounded-full flex flex-col items-center min-w-[140px]">
                    <span className="text-[10px] text-gold/80 font-bold uppercase tracking-widest mb-1">Total Pot</span>
                    <span className="font-display text-2xl font-bold text-white glow-text-gold tabular-nums">
                        {pot.toLocaleString()}
                    </span>
                </div>
            </div>

        </div>
    );
}
