'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { PlayerCard } from './PlayerCard';


import { COMMUNITY_CARDS_COUNT } from '@/lib/poker/types';
import { PotDisplay } from './PotDisplay';
import { BetDisplay } from './BetDisplay';
import { PhaseTransitionModal } from './PhaseTransitionModal';

export function TableView() {
    const { players, phase, currentPlayerIndex, pots, getTotalPot } = useGameStore();

    // 円形配置の角度計算
    const getPlayerPosition = (index: number, total: number) => {
        // 上から時計回りに配置
        const angleOffset = -90; // 12時の位置からスタート
        const angle = (360 / total) * index + angleOffset;
        const radian = (angle * Math.PI) / 180;

        // 楕円形に配置（横長）- テーブルの外側に配置
        const radiusX = 180;
        const radiusY = 130;

        const x = Math.cos(radian) * radiusX;
        const y = Math.sin(radian) * radiusY;

        return { x, y };
    };

    const targetCardCount = COMMUNITY_CARDS_COUNT[phase];

    return (
        <div className="relative w-full aspect-[4/3] max-w-lg mx-auto">
            {/* テーブル背景 */}
            <div className="absolute inset-4 rounded-[50%] felt-texture border-8 border-amber-900 shadow-2xl">
                {/* Community Cards - Center with Pot above */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex flex-col items-center gap-2 z-10">
                        {/* Pot Display - directly above cards */}
                        <PotDisplay pots={pots} totalPot={getTotalPot()} />

                        {/* コミュニティカードスロット */}
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-8 h-11 rounded border-2 transition-all duration-300 ${i < targetCardCount
                                            ? 'border-white/60 bg-white/10'
                                            : 'border-white/20 bg-transparent'
                                            }`}
                                    />
                                ))}
                            </div>
                            {targetCardCount > 0 && (
                                <span className="text-xs text-white/60">
                                    {targetCardCount}枚
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* プレイヤーとチップの配置 */}
            <div className="absolute inset-0 pointer-events-none">
                {players.map((player, index) => {
                    const pos = getPlayerPosition(index, players.length);
                    // チップはプレイヤーの内側に配置（上半分なら下に、下半分なら上に）
                    // pos.y > 0 means bottom half of table
                    const betOffsetY = pos.y > 0 ? -35 : 35;
                    const chipPos = { x: pos.x, y: pos.y + betOffsetY };

                    const isActive = index === currentPlayerIndex;

                    return (
                        <div key={player.id}>
                            {/* ベットチップ表示 */}
                            <AnimatePresence>
                                {player.currentBet > 0 && (
                                    <motion.div
                                        key={`bet-${player.id}`}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                                        style={{
                                            left: `calc(50% + ${chipPos.x}px)`,
                                            top: `calc(50% + ${chipPos.y}px)`,
                                        }}
                                    >
                                        <BetDisplay
                                            amount={player.currentBet}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* プレイヤーカード */}
                            <div
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-auto"
                                style={{
                                    left: `calc(50% + ${pos.x}px)`,
                                    top: `calc(50% + ${pos.y}px)`,
                                    zIndex: isActive ? 10 : 1,
                                }}
                            >
                                <PlayerCard player={player} isActive={isActive} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Phase Transition Modal */}
            <PhaseTransitionModal />
        </div>
    );
}
