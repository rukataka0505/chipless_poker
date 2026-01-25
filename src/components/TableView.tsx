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
            const confirmMessage = `Update chip count for "${editingPlayer.name}"?\n${editingPlayer.stack} -> ${stack}`;
            if (window.confirm(confirmMessage)) {
                updatePlayerStack(editingPlayer.id, stack);
            }
        }
    };

    const getPlayerPosition = (index: number, total: number) => {
        const angleOffset = -90;
        const angle = (360 / total) * index + angleOffset;
        const radian = (angle * Math.PI) / 180;

        // Revised dimensions for better spacing
        const radiusX = 300;
        const radiusY = 160;

        const x = Math.cos(radian) * radiusX;
        const y = Math.sin(radian) * radiusY;

        return { x, y };
    };

    const targetCardCount = COMMUNITY_CARDS_COUNT[phase];

    return (
        <div className="relative w-full h-[600px] flex items-center justify-center my-8 perspective-[1000px]">
            {/* Center Glow Ambience */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-electric/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Table / Arena Visual */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full border border-white/5 bg-black/40 backdrop-blur-sm shadow-2xl transform rotate-x-12 pointer-events-none">
                {/* Decorative Rings */}
                <div className="absolute inset-0 rounded-full border border-white/5 scale-90" />
                <div className="absolute inset-0 rounded-full border border-gold/5 scale-75" />
            </div>

            {/* Central Area: Community Cards & Pot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] z-10 flex flex-col items-center gap-8">
                <div className="translate-y-[10px]">
                    <PotDisplay pot={getTotalPot()} stage={phase} />
                </div>

                <div className="flex items-center gap-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div
                            key={i}
                            className={`
                                w-14 h-20 rounded-lg border flex items-center justify-center
                                transition-all duration-700 ease-out transform
                                ${i < targetCardCount
                                    ? 'bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] opacity-100'
                                    : 'bg-white/5 border-white/10 opacity-30'
                                }
                            `}
                        >
                            {/* Card Back / Front Design Placeholder */}
                            {i < targetCardCount && (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300 rounded-md" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Players */}
            {['ADD_BUTTON', ...players].map((item, index) => {
                const totalItems = players.length + 1;
                const pos = getPlayerPosition(index, totalItems);

                // Adjust position relative to center
                // Since this is absolutely positioned in a flex center container, 
                // we treat (0,0) as center, so just add pos.x, pos.y

                if (item === 'ADD_BUTTON') {
                    return (
                        <div
                            key="add"
                            className="absolute transition-all duration-500 z-20"
                            style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
                        >
                            <AddPlayerCard onClick={handleAddClick} />
                        </div>
                    )
                }

                const player = item as Player;
                const isActive = index === currentPlayerIndex;

                return (
                    <div
                        key={player.id}
                        className="absolute transition-all duration-500 z-20"
                        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
                    >
                        <PlayerCard
                            player={player}
                            isActive={isActive}
                            isDealer={false} // Dealer logic needs to be passed or derived
                            position="" // Position logic needs to be derived
                        />

                    </div>
                );
            })}

            <EditPlayerModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSavePlayer}
                player={editingPlayer}
                isAdding={isAddingPlayer}
            />

            <PhaseTransitionModal />
        </div>
    );
}
