'use client';

import React from 'react';
import { AlertCircle, Layers } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { DEALER_INSTRUCTIONS, GamePhase } from '@/lib/poker/types';
import { Card } from './ui/Card';

const PHASE_LABELS: Record<GamePhase, string> = {
    SETUP: 'SETUP',
    PREFLOP: 'PREFLOP',
    FLOP: 'FLOP',
    TURN: 'TURN',
    RIVER: 'RIVER',
    SHOWDOWN: 'SHOWDOWN',
};

const PHASE_COLORS: Record<GamePhase, string> = {
    SETUP: 'text-gray-400 border-gray-500/50',
    PREFLOP: 'text-blue-400 border-blue-500/50',
    FLOP: 'text-green-400 border-green-500/50',
    TURN: 'text-yellow-400 border-yellow-500/50',
    RIVER: 'text-red-400 border-red-500/50',
    SHOWDOWN: 'text-purple-400 border-purple-500/50',
};

export function DealerNavigation() {
    const { phase, handNumber, getTotalPot } = useGameStore();

    if (phase === 'SHOWDOWN' || phase === 'SETUP') return null;

    return (
        <Card variant="default" className="p-4 mb-4 bg-black">
            <div className="flex items-center justify-between mb-0">
                <div className="flex items-center gap-4">
                    <span
                        className={`
                            px-3 py-1 rounded-full text-xs font-bold font-display tracking-widest uppercase border bg-white/5
                            ${PHASE_COLORS[phase]}
                        `}
                    >
                        {PHASE_LABELS[phase]}
                    </span>
                    {handNumber > 0 && (
                        <span className="text-xs text-text-tertiary uppercase tracking-wider">
                            Hand #{handNumber}
                        </span>
                    )}
                </div>

                <div className="text-xs text-text-secondary flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-gold" />
                    {DEALER_INSTRUCTIONS[phase]}
                </div>
            </div>
        </Card>
    );
}
