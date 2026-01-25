'use client';

import React from 'react';
import { AlertCircle, Shuffle, Layers } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { DEALER_INSTRUCTIONS, GamePhase } from '@/lib/poker/types';

const PHASE_LABELS: Record<GamePhase, string> = {
    SETUP: 'セットアップ',
    PREFLOP: 'プリフロップ',
    FLOP: 'フロップ',
    TURN: 'ターン',
    RIVER: 'リバー',
    SHOWDOWN: 'ショーダウン',
};

const PHASE_COLORS: Record<GamePhase, string> = {
    SETUP: 'bg-gray-600',
    PREFLOP: 'bg-blue-600',
    FLOP: 'bg-green-600',
    TURN: 'bg-yellow-600',
    RIVER: 'bg-red-600',
    SHOWDOWN: 'bg-purple-600',
};

export function DealerNavigation() {
    const { phase, handNumber, getTotalPot } = useGameStore();
    const totalPot = getTotalPot();

    return (
        <div className="glass-panel rounded-2xl p-4 mb-4">
            {/* フェーズ表示 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${PHASE_COLORS[phase]}`}>
                        {PHASE_LABELS[phase]}
                    </span>
                    {handNumber > 0 && (
                        <span className="text-sm text-gray-300">
                            ハンド #{handNumber}
                        </span>
                    )}
                </div>

                {/* ポット表示 */}
                {totalPot > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-4 py-1 rounded-full">
                        <Layers className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 font-bold">{totalPot}</span>
                    </div>
                )}
            </div>

            {/* ディーラー指示 */}
            <div className="flex items-start gap-3 bg-white/5 rounded-xl p-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-xs text-gray-400 mb-1">ディーラーへの指示</p>
                    <p className="text-white font-medium">
                        {DEALER_INSTRUCTIONS[phase]}
                    </p>
                </div>
            </div>
        </div>
    );
}
