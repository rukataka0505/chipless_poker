'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { PlayerCard } from './PlayerCard';
import { COMMUNITY_CARDS_COUNT } from '@/lib/poker/types';
import { PotDisplay } from './PotDisplay';
import { BetDisplay } from './BetDisplay';

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
        toggleSitOutNextHand,
        toggleDeletePlayerNextHand
    } = useGameStore();

    const [editingPlayer, setEditingPlayer] = React.useState<Player | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isAddingPlayer, setIsAddingPlayer] = React.useState(false);

    // Dynamic layout state
    const [dimensions, setDimensions] = React.useState({
        scale: 1,
        isPortrait: false,
        layout: { radiusX: 420, radiusY: 160, tableW: 700, tableH: 350 }
    });
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const handleResize = () => {
            const TOP_OFFSET = 130;
            const BOTTOM_OFFSET = 140;

            const availableW = window.innerWidth;
            const availableH = window.innerHeight - TOP_OFFSET - BOTTOM_OFFSET;

            // Determine orientation based on available drawable area
            const isPortrait = availableH > availableW;

            // Reference dimensions for calculation
            // These roughly match the component's unscaled sizes
            // Portrait: Card ~204x250, Table ~390x680
            // Landscape: Card ~176x200, Table ~700x350
            const refLayout = isPortrait
                ? {
                    radiusX: 210,
                    radiusY: 330,
                    tableW: 390,
                    tableH: 680,
                    cardW: 204,
                    cardH: 260
                }
                : {
                    radiusX: 420,
                    radiusY: 160,
                    tableW: 700,
                    tableH: 350,
                    cardW: 180,
                    cardH: 200
                };

            // Calculate required space including cards (radius * 2 is diameter between centers)
            // Plus half card size on each side + padding
            const requiredW = (refLayout.radiusX * 2) + refLayout.cardW + 40; // 20px padding each side
            const requiredH = (refLayout.radiusY * 2) + refLayout.cardH + 40;

            // Calculate fit scale
            const scaleW = availableW / requiredW;
            const scaleH = availableH / requiredH;
            const scale = Math.min(scaleW, scaleH, 1.2); // Cap max scale at 1.2 to avoid too large on 4k

            setDimensions({
                scale,
                isPortrait,
                layout: refLayout
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            updatePlayerStack(editingPlayer.id, stack);
        }
    };

    const getPlayerPosition = (index: number, total: number) => {
        const angleOffset = -90;
        const angle = (360 / total) * index + angleOffset;
        const radian = (angle * Math.PI) / 180;

        const x = Math.cos(radian) * dimensions.layout.radiusX;
        const y = Math.sin(radian) * dimensions.layout.radiusY;

        return { x, y };
    };

    const targetCardCount = COMMUNITY_CARDS_COUNT[phase];

    if (!mounted) return <div className="w-full h-full" />;

    return (
        <div
            className="absolute left-0 right-0 flex items-center justify-center overflow-hidden pointer-events-none"
            style={{
                top: '130px',
                bottom: '140px',
                // Debug background to verify area if needed: backgroundColor: 'rgba(255,0,0,0.1)' 
            }}
        >
            {/* Scaled Container */}
            <div
                className="relative flex items-center justify-center pointer-events-auto transition-transform duration-300 ease-out"
                style={{
                    transform: `scale(${dimensions.scale})`,
                    width: dimensions.layout.tableW + 400, // Ensure ample space for absolute positioned elements
                    height: dimensions.layout.tableH + 300
                }}
            >
                {/* Center Glow Ambience */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-electric/5 rounded-full blur-[100px] pointer-events-none"
                    style={{ width: dimensions.layout.tableW, height: dimensions.layout.tableH }}
                />

                {/* Table / Arena Visual */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5 bg-black/40 backdrop-blur-sm shadow-2xl pointer-events-none"
                    style={{ width: dimensions.layout.tableW, height: dimensions.layout.tableH }}
                >
                    {/* Decorative Rings */}
                    <div className="absolute inset-0 rounded-full border border-white/5 scale-90" />
                    <div className="absolute inset-0 rounded-full border border-gold/5 scale-75" />
                </div>

                {/* Central Area: Community Cards & Pot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] z-10 flex flex-col items-center gap-8">
                    <div className="translate-y-[10px]">
                        <PotDisplay pots={pots} stage={phase} />
                    </div>

                    <div className={`flex items-center ${dimensions.isPortrait ? 'gap-2 scale-90' : 'gap-3'}`}>
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

                    if (item === 'ADD_BUTTON') {
                        return (
                            <div
                                key="add"
                                className="absolute transition-all duration-500 z-20"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
                                }}
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

                    if (players.length === 2 && player.position === 'D') {
                        positionLabel = 'SB';
                    }

                    // Determine Bet Type
                    let betType: 'BET' | 'RAISE' | 'CALL' | 'CHECK' = 'BET';
                    const lastAction = [...actionHistory].reverse().find(a => a.playerId === player.id);
                    if (lastAction) {
                        if (lastAction.action === 'RAISE') betType = 'RAISE';
                        if (lastAction.action === 'ALL_IN') betType = 'RAISE';
                        if (lastAction.action === 'CALL') betType = 'CALL';
                        if (lastAction.action === 'CHECK') betType = 'CHECK';
                    }

                    if (betType === 'CHECK' && !player.hasActedThisRound) {
                        betType = 'BET';
                    }

                    return (
                        <div
                            key={player.id}
                            className="absolute transition-all duration-500 z-20"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
                            }}
                        >
                            <PlayerCard
                                player={player}
                                isActive={isActive}
                                isDealer={isDealer}
                                position={positionLabel}
                                onClick={() => handlePlayerClick(player)}
                                betType={betType}
                                isShowdown={phase === 'SHOWDOWN'}
                                isContestingPot={!player.folded}
                                isPortrait={dimensions.isPortrait}
                            />
                            {/* Status Badges for Sit Out / Next Hand */}
                            {(player.isSittingOut || player.isSittingOutNextHand || player.isDeletedNextHand) && (
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-50 whitespace-nowrap pointer-events-none">
                                    {player.isSittingOut && (
                                        <span className="text-[10px] font-bold bg-black/60 text-gray-400 px-2 py-0.5 rounded-full border border-gray-600">
                                            離席中
                                        </span>
                                    )}
                                    {player.isSittingOutNextHand !== player.isSittingOut && (
                                        <span className="text-[10px] font-bold bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded-full border border-blue-500/50">
                                            {player.isSittingOutNextHand ? '次ハンド離席' : '次ハンド着席'}
                                        </span>
                                    )}
                                    {player.isDeletedNextHand && (
                                        <span className="text-[10px] font-bold bg-red-900/80 text-red-200 px-2 py-0.5 rounded-full border border-red-500/50">
                                            削除予約
                                        </span>
                                    )}
                                </div>
                            )}

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
                onToggleSitOut={toggleSitOutNextHand}
                onDeletePlayer={toggleDeletePlayerNextHand}
            />
        </div>
    );
}
