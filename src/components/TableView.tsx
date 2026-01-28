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

interface TableViewProps {
    topOffset?: number;
    bottomOffset?: number;
}

export function TableView({ topOffset = 130, bottomOffset = 140 }: TableViewProps) {
    const {
        players,
        phase,
        currentPlayerIndex,
        pots,
        updatePlayerStack,
        updatePlayerName,
        addPlayer,
        actionHistory,
        isTransitioning,
        toggleSitOutNextHand,
        toggleDeletePlayerNextHand,
        resumeGame,
        pendingPhase,
        isShowdownResolved,
        selectedWinners
    } = useGameStore();

    const [editingPlayer, setEditingPlayer] = React.useState<Player | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [isAddingPlayer, setIsAddingPlayer] = React.useState(false);

    // Dynamic layout state
    const [dimensions, setDimensions] = React.useState<{
        scale: number;
        isPortrait: boolean;
        layout: {
            radiusX: number;
            radiusY: number;
            tableW: number;
            tableH: number;
            cardW: number;
            cardH: number;
        }
    }>({
        scale: 1,
        isPortrait: false,
        layout: {
            radiusX: 420,
            radiusY: 160,
            tableW: 700,
            tableH: 350,
            cardW: 180,
            cardH: 200
        }
    });
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        const handleResize = () => {
            // 親の制約を無視し、画面幅をフルに使用
            // 横方向の+50pxは削除（ユーザー要望により元に戻す）
            const availableW = window.innerWidth;
            // 縦方向は+50px維持に加え、上部余白調整分(-20px)も考慮して描画エリアを確保
            const availableH = (window.innerHeight - (topOffset - 20) - bottomOffset) + 50;

            // Determine orientation based on available drawable area
            // Stricter threshold: only switch to landscape if width is significantly larger than height
            // Portrait mode will be maintained until width > height * 1.3
            const isPortrait = availableW < availableH * 1.3;

            // Base dimensions
            let portraitDims = { radiusX: 210, radiusY: 330, cardW: 204, cardH: 260 };
            const landscapeDims = { radiusX: 420, radiusY: 160, cardW: 180, cardH: 200 };

            // Portraitモードの場合、画面アスペクト比に合わせてradiusYを動的に拡張する
            // 横幅がいっぱいで縦が余る場合、radiusYを伸ばして縦も埋める
            if (isPortrait) {
                // 現在のradiusXに基づく横方向のスケール
                const requiredW = (portraitDims.radiusX * 2) + portraitDims.cardW;
                const scaleW = availableW / requiredW;

                // このスケールで画面高さを満たすために必要なradiusYを逆算
                // availableH = scaleW * ((radiusY * 2) + cardH)
                // radiusY = ((availableH / scaleW) - cardH) / 2
                const optimalRadiusY = ((availableH / scaleW) - portraitDims.cardH) / 2;

                // 元のradiusYより大きい場合のみ採用（縮むのは防ぐ）
                if (optimalRadiusY > portraitDims.radiusY) {
                    portraitDims = { ...portraitDims, radiusY: optimalRadiusY };
                }
            }

            const currentDims = isPortrait ? portraitDims : landscapeDims;

            const refLayout = {
                ...currentDims,
                // テーブルサイズを調整：カード中心がテーブル端に近づくように（カード幅の0.5倍を加算＝カード半分がはみ出る設定）
                // ユーザー要望「外側に配置を移動」に対応するため、テーブルに対する相対位置を外へ
                tableW: (currentDims.radiusX * 2) + (currentDims.cardW * 0.5),
                tableH: (currentDims.radiusY * 2) + (currentDims.cardH * 0.5),
            };

            // Calculate required space: 楕円の直径 + 片側のカードサイズ (カードは中央配置なので片側のみ)
            const requiredW = (refLayout.radiusX * 2) + refLayout.cardW;
            const requiredH = (refLayout.radiusY * 2) + refLayout.cardH;

            // 利用可能領域に対して最大限フィットさせる（上限なし）
            const scaleW = availableW / requiredW;
            const scaleH = availableH / requiredH;
            // 上限を設けず、利用可能領域を100%使用
            const scale = Math.min(scaleW, scaleH);

            setDimensions({
                scale,
                isPortrait,
                layout: refLayout
            });
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [topOffset, bottomOffset]); // オフセット変更時にも再計算

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
            updatePlayerName(editingPlayer.id, name);
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
                top: `${topOffset - 20}px`, // 上部余白調整変更 (-20px)
                bottom: `${bottomOffset}px`,
                // Debug background to verify area if needed: backgroundColor: 'rgba(255,0,0,0.1)' 
            }}
        >
            {/* Scaled Container */}
            <div
                className="relative flex items-center justify-center pointer-events-auto transition-transform duration-300 ease-out"
                style={{
                    transform: `scale(${dimensions.scale})`,
                    // Container = table + (card size for each side) - tighter fit
                    width: (dimensions.layout.radiusX * 2) + (dimensions.layout.cardW || 180),
                    height: (dimensions.layout.radiusY * 2) + (dimensions.layout.cardH || 200)
                }}
            >
                {/* Table / Arena Visual - Inner scaled for tighter look */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ width: dimensions.layout.tableW, height: dimensions.layout.tableH }}
                >
                    {/* Actual visible table background & border - scaled down */}
                    <div className="absolute inset-0 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl scale-[0.85]">
                        {/* Decorative Inner Ring */}
                        <div className="absolute inset-0 rounded-full border border-gold/5 scale-90" />
                    </div>
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
                    const isActive = playerIndex === currentPlayerIndex && !isTransitioning && !pendingPhase;

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
                                isWinner={(isShowdownResolved && Array.from(selectedWinners.values()).flat().includes(player.id)) || (phase === 'SHOWDOWN' && players.filter(p => !p.folded).length === 1 && !player.folded)}
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
                                            次のハンドから削除
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
