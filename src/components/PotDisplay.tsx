'use client';

import React from 'react';
import { Pot } from '@/lib/poker/types';

interface PotDisplayProps {
    pots: Pot[];
    stage?: string;
}

export function PotDisplay({ pots, stage }: PotDisplayProps) {
    // Calculate total pot
    const totalPot = pots.reduce((sum, pot) => sum + pot.amount, 0);

    // Filter out empty pots for display
    const activePots = pots.filter(pot => pot.amount > 0);
    const hasSidePots = activePots.length > 1;

    return (
        <div className="flex flex-col items-center justify-center gap-2 z-0">
            {stage && (
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">
                    {stage}
                </span>
            )}

            {/* Total Pot Display */}
            <div className="relative group">
                <div className="relative glass-panel bg-yellow-100/10 border-yellow-100/30 px-10 py-4 rounded-full flex flex-col items-center min-w-[140px] shadow-[0_0_15px_rgba(255,255,200,0.1)]">
                    <span className="text-[10px] text-yellow-100/90 font-bold uppercase tracking-widest mb-1">Total Pot</span>
                    <span className="font-display text-5xl font-bold text-white glow-text-gold tabular-nums">
                        {totalPot.toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Individual Pots (Main + Side Pots) - only show if there are side pots */}
            {hasSidePots && (
                <div className="flex flex-wrap items-center justify-center gap-2 mt-1 max-w-[320px]">
                    {activePots.slice(0, 5).map((pot, index) => {
                        const isMainPot = index === 0;
                        const label = isMainPot ? 'Main' : `Side ${index}`;

                        return (
                            <div
                                key={index}
                                className={`
                                    flex flex-col items-center px-3 py-1.5 rounded-full
                                    ${isMainPot
                                        ? 'bg-white/10 border border-white/20'
                                        : 'bg-electric/10 border border-electric/20'
                                    }
                                `}
                            >
                                <span className={`
                                    text-[8px] font-bold uppercase tracking-wider
                                    ${isMainPot ? 'text-white/70' : 'text-electric/70'}
                                `}>
                                    {label}
                                </span>
                                <span className={`
                                    font-display text-sm font-bold tabular-nums
                                    ${isMainPot ? 'text-white' : 'text-electric'}
                                `}>
                                    {pot.amount.toLocaleString()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
