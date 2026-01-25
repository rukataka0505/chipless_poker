'use client';

import React from 'react';
import { Layers, Check } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { GamePhase } from '@/lib/poker/types';

const PHASE_MESSAGES: Record<GamePhase, string> = {
    SETUP: '',
    PREFLOP: '各プレイヤーに2枚ずつカードを配ってください',
    FLOP: 'コミュニティカードを3枚置いてください',
    TURN: '4枚目のコミュニティカードを置いてください',
    RIVER: '5枚目のコミュニティカードを置いてください',
    SHOWDOWN: '',
};

const PHASE_LABELS: Record<GamePhase, string> = {
    SETUP: 'セットアップ',
    PREFLOP: 'プリフロップ',
    FLOP: 'フロップ',
    TURN: 'ターン',
    RIVER: 'リバー',
    SHOWDOWN: 'ショーダウン',
};

export function PhaseTransitionModal() {
    const { pendingPhase, confirmPhaseTransition } = useGameStore();

    if (!pendingPhase) {
        return null;
    }

    const message = PHASE_MESSAGES[pendingPhase];
    const label = PHASE_LABELS[pendingPhase];

    // Don't show modal for SETUP or SHOWDOWN (no card instructions needed)
    if (!message) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel rounded-3xl p-8 max-w-md mx-4 text-center animate-scale-in">
                {/* Phase badge */}
                <div className="flex justify-center mb-6">
                    <span className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg">
                        {label}
                    </span>
                </div>

                {/* Card icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Layers className="w-10 h-10 text-yellow-400" />
                    </div>
                </div>

                {/* Instructions */}
                <p className="text-xl text-white font-medium mb-8">
                    {message}
                </p>

                {/* Confirm button */}
                <button
                    onClick={confirmPhaseTransition}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                    <Check className="w-6 h-6" />
                    OK
                </button>
            </div>
        </div>
    );
}
