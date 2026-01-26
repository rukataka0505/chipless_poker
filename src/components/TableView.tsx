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
        updatePlayerStack,
        addPlayer,
        actionHistory,
        isTransitioning,
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
            const confirmMessage = `「${editingPlayer.name}」のチップ数を変更しますか？\n${editingPlayer.stack} -> ${stack}`;
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
        const radiusX = 420;
        const radiusY = 160;

        const x = Math.cos(radian) * radiusX;
        const y = Math.sin(radian) * radiusY;

        return { x, y };
    };

    const targetCardCount = COMMUNITY_CARDS_COUNT[phase];

    return (
        <div className="relative w-full h-[400px] sm:h-[600px] flex items-center justify-center my-4 sm:my-8 perspective-[1000px] overflow-visible">
            {/* Mobile Scale Wrapper */}
            <div className="transform scale-[0.55] sm:scale-100 -translate-y-20 sm:-translate-y-32 transition-transform duration-300 origin-center">
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
                        <PotDisplay pots={pots} stage={phase} />
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
                                style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)` }}
                            >
                                <AddPlayerCard onClick={handleAddClick} />
                            </div>
                        )
                    }

                    const player = item as Player;
                    const playerIndex = index - 1; // Adjust for ADD_BUTTON at index 0
                    const isActive = playerIndex === currentPlayerIndex && !isTransitioning;

                    // Determine visuals for Position Badges
                    let isDealer = player.position === 'D';
                    let positionLabel = '';

                    if (player.position === 'SB') positionLabel = 'SB';
                    if (player.position === 'BB') positionLabel = 'BB';

                    // Special Case: Heads Up (2 Players)
                    // In Heads Up, the Button (Dealer) is also the Small Blind.
                    // The other player is Big Blind.
                    // Our gameState sets Dealer as 'D' and other as 'BB'.
                    // So if we see 'D' and there are only 2 players, we should also show 'SB'.
                    if (players.length === 2 && player.position === 'D') {
                        positionLabel = 'SB';
                    }

                    // Determine Bet Type (Yellow for BET, Lime for CALL, Red for RAISE)
                    let betType: 'BET' | 'RAISE' | 'CALL' | 'CHECK' = 'BET';

                    if (player.hasActedThisRound) {
                        const lastAction = [...actionHistory].reverse().find(a => a.playerId === player.id);
                        // If they have bet > 0 and their last action was RAISE (or derived from it), show Red.
                        // Note: If they Called a Raise, usually it's just a call (Yellow-Green).
                        // Use RAISE color only if they initiated a Raise.
                        if (lastAction?.action === 'RAISE') betType = 'RAISE';
                        if (lastAction?.action === 'CALL') betType = 'CALL';
                        if (lastAction?.action === 'CHECK') betType = 'CHECK';
                    }

                    return (
                        <div
                            key={player.id}
                            className="absolute transition-all duration-500 z-20"
                            style={{ transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)` }}
                        >
                            <PlayerCard
                                player={player}
                                isActive={isActive}
                                isDealer={isDealer}
                                position={positionLabel}
                                onClick={() => handlePlayerClick(player)}
                                betType={betType}
                            />

                        </div>
                    );
                })}
            </div>

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
