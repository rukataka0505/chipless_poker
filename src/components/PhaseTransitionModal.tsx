'use client';

import React from 'react';
import { Layers, Check } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { GamePhase } from '@/lib/poker/types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

const PHASE_MESSAGES: Record<GamePhase, string> = {
    SETUP: '',
    PREFLOP: '各プレイヤーに2枚ずつ配ってください',
    FLOP: '3枚のフロップを開いてください',
    TURN: 'ターンを1枚開いてください',
    RIVER: 'リバーを1枚開いてください',
    SHOWDOWN: '',
    PAUSED: '',
};

const PHASE_LABELS: Record<GamePhase, string> = {
    SETUP: 'SETUP',
    PREFLOP: 'PREFLOP',
    FLOP: 'FLOP',
    TURN: 'TURN',
    RIVER: 'RIVER',
    SHOWDOWN: 'SHOWDOWN',
    PAUSED: 'PAUSED',
};

export function PhaseTransitionModal() {
    const { pendingPhase, confirmPhaseTransition } = useGameStore();

    if (!pendingPhase || !PHASE_MESSAGES[pendingPhase]) {
        return null;
    }

    const message = PHASE_MESSAGES[pendingPhase];
    const label = PHASE_LABELS[pendingPhase];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90">
            <Card variant="highlight" className="max-w-md mx-6 p-8 text-center border-gold/20">
                <div className="flex justify-center mb-8">
                    <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-electric/20 to-electric/5 border border-electric/30">
                        <span className="text-electric font-bold font-display tracking-widest text-sm">
                            {label}
                        </span>
                    </div>
                </div>

                <div className="flex justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full" />
                    <div className="relative w-24 h-24 rounded-full bg-black border border-gold/30 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                        <Layers className="w-10 h-10 text-gold" />
                    </div>
                </div>

                <p className="text-lg text-white font-medium mb-10 leading-relaxed">
                    {message}
                </p>

                <Button
                    variant="gold"
                    size="lg"
                    className="w-full"
                    onClick={confirmPhaseTransition}
                    icon={<Check className="w-5 h-5" />}
                >
                    確認して進む
                </Button>
            </Card>
        </div>
    );
}
