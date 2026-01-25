'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { PlayerCard } from './PlayerCard';


import { COMMUNITY_CARDS_COUNT } from '@/lib/poker/types';
import { PotDisplay } from './PotDisplay';
import { BetDisplay } from './BetDisplay';
import { PhaseTransitionModal } from './PhaseTransitionModal';

import { EditPlayerModal } from './EditPlayerModal';
import { AddPlayerCard } from './AddPlayerCard';
import { Player } from '@/lib/poker/types';

export function TableView() {
    const {
        players,
        phase,
        currentPlayerIndex,
        pots,
        getTotalPot,
        updatePlayerStack,
        addPlayer,
    } = useGameStore();

    const [editingPlayer, setEditingPlayer] = React.useState<Player | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isAddingPlayer, setIsAddingPlayer] = React.useState(false);

    const handlePlayerClick = (player: Player) => {
        setEditingPlayer(player);
        setIsAddingPlayer(false);
        setIsEditModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingPlayer(null);
        setIsAddingPlayer(true);
        setIsEditModalOpen(true);
    };

    const handleSavePlayer = (name: string, stack: number) => {
        if (isAddingPlayer) {
            addPlayer(name, stack);
        } else if (editingPlayer) {
            const confirmMessage = `"${editingPlayer.name}"のチップ数を変更しますか？\n${editingPlayer.stack} -> ${stack}`;
            if (window.confirm(confirmMessage)) {
                updatePlayerStack(editingPlayer.id, stack);
            }
        }
    };

    const getPlayerPosition = (index: number, total: number) => {
        // 上から時計回りに配置
        const angleOffset = -90; // 12時の位置からスタート
        const angle = (360 / total) * index + angleOffset;
        const radian = (angle * Math.PI) / 180;

        // 楕円形に配置（スタジアムに近い横長）- テーブルの外側に配置
        // Aspect 2/1に合わせて横幅を広げる
        const radiusX = 260;
        const radiusY = 130;

        const x = Math.cos(radian) * radiusX;
        const y = Math.sin(radian) * radiusY;

        return { x, y };
    };

    const targetCardCount = COMMUNITY_CARDS_COUNT[phase];

    return (
        <div className="relative w-full aspect-[2/1] max-w-2xl mx-auto my-12">
            {/* テーブル全体（レール + フェルト） - Stadium Shape */}
            <div className="absolute inset-0 rounded-full table-rail z-0">
                <div className="absolute inset-5 rounded-full felt-texture border border-black/30 shadow-inner">
                    {/* Community Cards - Center with Pot above */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center gap-4 z-10 w-full max-w-sm">
                            {/* Pot Display - directly above cards */}
                            <PotDisplay pots={pots} totalPot={getTotalPot()} />

                            {/* コミュニティカードスロットエリア */}
                            <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-black/10 backdrop-blur-sm border border-white/5 shadow-inner">
                                <div className="flex gap-2">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-10 h-14 rounded-md border-2 transition-all duration-500 transform ${i < targetCardCount
                                                ? 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.6)] scale-100'
                                                : 'border-white/10 bg-white/5 scale-95'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* プレイヤーとチップの配置 - Add Playerボタンも含めて配置計算 */}
            <div className="absolute inset-0 pointer-events-none">
                {/* 
                   Render existing players AND the Add Player button in the circle 
                   We treat "Add Player" button as index = players.length
                */}
                {[...players, 'ADD_BUTTON'].map((item, index) => {
                    const totalItems = players.length + 1; // +1 for Add Button
                    const pos = getPlayerPosition(index, totalItems);

                    // チップはプレイヤーの内側に配置
                    const betOffsetY = pos.y > 0 ? -35 : 35;
                    const chipPos = { x: pos.x, y: pos.y + betOffsetY };

                    // If it's the Add Button
                    if (item === 'ADD_BUTTON') {
                        return (
                            <div
                                key="add-player-btn"
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-auto"
                                style={{
                                    left: `calc(50% + ${pos.x}px)`,
                                    top: `calc(50% + ${pos.y}px)`,
                                    zIndex: 1,
                                }}
                            >
                                <AddPlayerCard onClick={handleAddClick} />
                            </div>
                        );
                    }

                    // Otherwise it's a player
                    const player = item as Player;
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
                                <PlayerCard
                                    player={player}
                                    isActive={isActive}
                                    onClick={() => handlePlayerClick(player)}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit/Add Player Modal */}
            <EditPlayerModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSavePlayer}
                player={editingPlayer}
                isAdding={isAddingPlayer}
            />

            {/* Phase Transition Modal */}
            <PhaseTransitionModal />
        </div>
    );
}
