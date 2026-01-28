'use client';

import React from 'react';
import { AlertCircle, Layers } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { DEALER_INSTRUCTIONS, GamePhase } from '@/lib/poker/types';
import { Card } from './ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

const PHASE_LABELS: Record<GamePhase, string> = {
    SETUP: 'SETUP',
    PREFLOP: 'PREFLOP',
    FLOP: 'FLOP',
    TURN: 'TURN',
    RIVER: 'RIVER',
    SHOWDOWN: 'SHOWDOWN',
    PAUSED: 'PAUSED',
};

const PHASE_COLORS: Record<GamePhase, string> = {
    SETUP: 'text-gray-400 border-gray-500/50',
    PREFLOP: 'text-blue-400 border-blue-500/50',
    FLOP: 'text-green-400 border-green-500/50',
    TURN: 'text-yellow-400 border-yellow-500/50',
    RIVER: 'text-red-400 border-red-500/50',
    SHOWDOWN: 'text-purple-400 border-purple-500/50',
    PAUSED: 'text-red-400 border-red-500/50',
};

export function DealerNavigation() {
    const { phase, handNumber, getTotalPot, players, resumeGame, toggleSitOutNextHand } = useGameStore();
    const [isExpanded, setIsExpanded] = React.useState(false);

    if (phase === 'SHOWDOWN' || phase === 'SETUP') return null;

    const canResume = players.filter(p => !p.isSittingOut && p.stack > 0).length >= 2;

    return (
        <>
            <Card
                variant="default"
                className={`p-4 mb-4 transition-all ${phase === 'PAUSED'
                    ? canResume
                        ? 'cursor-pointer bg-teal-950/60 border-teal-500 hover:bg-teal-900/60'
                        : 'cursor-pointer bg-red-950/60 border-red-500 hover:bg-red-900/60'
                    : 'bg-black'
                    }`}
                style={phase === 'PAUSED' ? {
                    animation: canResume ? 'glow-teal 1.5s ease-in-out infinite' : 'glow 1.5s ease-in-out infinite',
                } : undefined}
                onClick={() => {
                    if (phase === 'PAUSED') setIsExpanded(true);
                }}
            >
                <style>{`
                    @keyframes glow {
                        0%, 100% { box-shadow: 0 0 10px rgba(255,0,0,0.2), 0 0 20px rgba(255,0,0,0.1); }
                        50% { box-shadow: 0 0 20px rgba(255,0,0,0.4), 0 0 30px rgba(255,0,0,0.2); }
                    }
                    @keyframes glow-teal {
                        0%, 100% { box-shadow: 0 0 10px rgba(20,184,166,0.2), 0 0 20px rgba(20,184,166,0.1); }
                        50% { box-shadow: 0 0 20px rgba(20,184,166,0.4), 0 0 30px rgba(20,184,166,0.2); }
                    }
                `}</style>
                <div className={`flex items-center mb-0 ${phase === 'PAUSED' ? 'justify-center' : 'justify-between'}`}>
                    {phase !== 'PAUSED' && (
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
                    )}

                    <div className={`text-xs flex items-center gap-2 ${phase === 'PAUSED' ? (canResume ? 'text-teal-300' : 'text-red-300') : 'text-text-secondary'}`}>
                        <AlertCircle className={`w-4 h-4 ${phase === 'PAUSED' ? (canResume ? 'text-teal-400' : 'text-red-400') : 'text-gold'}`} />
                        {phase === 'PAUSED' ? (
                            <span className="flex items-center gap-2 font-medium">
                                {canResume ? 'ゲームを再開できます' : DEALER_INSTRUCTIONS[phase]}
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${canResume ? 'bg-teal-500/30 text-teal-200 border-teal-500/30' : 'bg-red-500/30 text-red-200 border-red-500/30'}`}>
                                    {canResume ? 'タップして再開' : '待機中'}
                                </span>
                            </span>
                        ) : (
                            DEALER_INSTRUCTIONS[phase]
                        )}
                    </div>
                </div>
            </Card>

            {/* Paused Overlay Modal */}
            <AnimatePresence>
                {isExpanded && phase === 'PAUSED' && (
                    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsExpanded(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative bg-black/90 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl z-10"
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white font-display">ゲーム一時停止中</h2>
                                <p className="text-text-secondary">
                                    プレイ可能なプレイヤーが2人未満のため<br />
                                    ゲームを一時停止しています
                                </p>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-sm text-text-tertiary mb-2">再開するには</p>
                                <ul className="text-sm text-text-secondary space-y-1 text-left list-disc list-inside">
                                    <li>新しいプレイヤーを追加する</li>
                                    <li>離席中のプレイヤーを着席させる</li>
                                    <li>チップがなくなったプレイヤーに補充する</li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        resumeGame();
                                        setIsExpanded(false);
                                    }}
                                    disabled={!canResume}
                                    className={`
                                    w-full py-4 rounded-xl font-bold text-lg transition-all
                                    ${canResume
                                            ? 'bg-teal-700 text-white hover:bg-teal-600 shadow-[0_0_15px_rgba(20,184,166,0.3)]'
                                            : 'bg-white/10 text-gray-500 cursor-not-allowed'
                                        }
                                `}
                                >
                                    ゲームを再開する
                                </button>
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="text-text-tertiary hover:text-white text-sm py-2"
                                >
                                    閉じる
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
