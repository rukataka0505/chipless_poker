import React from 'react';

interface BetDisplayProps {
    amount: number;
}

export function BetDisplay({ amount }: BetDisplayProps) {
    return (
        <div className="bg-black/80 backdrop-blur-sm border border-gold/30 rounded-full px-3 py-1 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
            <span className="text-gold font-bold font-display tracking-wider flex items-center gap-1">
                <span className="text-[10px] opacity-70">BET</span>
                {amount.toLocaleString()}
            </span>
        </div>
    );
}
