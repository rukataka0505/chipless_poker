'use client';

import React, { useEffect } from 'react';
import { Trophy, Users, Check, ArrowRight, Undo2 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export function ShowdownPanel() {
    const {
        phase,
        pots,
        players,
        selectedWinners,
        selectWinners,
        resolveShowdown,
        proceedToNextHand,
        undo,
        canUndo,
        isShowdownResolved,
    } = useGameStore();

    const activePlayers = players.filter(p => !p.folded);
    const autoWinner = activePlayers.length === 1 ? activePlayers[0] : null;

    const getEligiblePlayersForPot = (potIndex: number) => {
        const pot = pots[potIndex];
        if (!pot) return [];
        return pot.eligiblePlayerIds
            .map(id => players.find(p => p.id === id))
            .filter(p => p && !p.folded) as typeof players;
    };

    useEffect(() => {
        if (phase !== 'SHOWDOWN' || isShowdownResolved || autoWinner) return;

        pots.forEach((pot, potIndex) => {
            const eligiblePlayers = getEligiblePlayersForPot(potIndex);
            if (eligiblePlayers.length === 1) {
                const currentWinners = selectedWinners.get(potIndex);
                const singlePlayerId = eligiblePlayers[0].id;
                if (!currentWinners || !currentWinners.includes(singlePlayerId)) {
                    selectWinners(potIndex, [singlePlayerId]);
                }
            }
        });
    }, [phase, pots, players, isShowdownResolved, autoWinner]);

    if (phase !== 'SHOWDOWN') {
        return null;
    }

    const handlePlayerSelect = (potIndex: number, playerId: string) => {
        const currentWinners = selectedWinners.get(potIndex) || [];
        if (currentWinners.includes(playerId)) {
            selectWinners(potIndex, currentWinners.filter(id => id !== playerId));
        } else {
            selectWinners(potIndex, [...currentWinners, playerId]);
        }
    };

    const canConfirm = () => {
        if (autoWinner) return true;
        return pots.every((_, i) => {
            const winners = selectedWinners.get(i);
            return winners && winners.length > 0;
        });
    };

    const handleConfirmSelection = () => {
        if (autoWinner) {
            pots.forEach((_, i) => {
                selectWinners(i, [autoWinner.id]);
            });
        }
        resolveShowdown();
    };

    const handleNextHand = () => {
        proceedToNextHand();
    };

    const isAutoWinnerMode = !!autoWinner;

    const getWinnersList = () => {
        const allWinnerIds = new Set<string>();
        pots.forEach((_, i) => {
            const ids = selectedWinners.get(i);
            ids?.forEach(id => allWinnerIds.add(id));
        });
        return players.filter(p => allWinnerIds.has(p.id));
    };

    const winners = getWinnersList();

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center pointer-events-none">
            <Card variant="default" className="w-full max-w-2xl pointer-events-auto backdrop-blur-2xl bg-black/80 border-t border-gold/20 shadow-2xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-gold" />
                            Showdown
                        </h2>
                        <button
                            onClick={() => undo()}
                            disabled={!canUndo()}
                            className={`text-xs flex items-center gap-1 transition-colors ${canUndo() ? 'text-gray-400 hover:text-white' : 'text-gray-700 cursor-not-allowed'}`}
                        >
                            <Undo2 size={16} />
                            Undo
                        </button>
                    </div>

                    {isAutoWinnerMode ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-5">
                            <div className="text-center p-6 bg-gold/5 rounded-2xl border border-gold/10">
                                <p className="text-text-secondary text-sm uppercase tracking-widest mb-2">Everyone else folded</p>
                                <div className="text-3xl font-display font-bold text-gold glow-text-gold">{autoWinner.name}</div>
                                <p className="text-white mt-1">Wins the pot!</p>
                            </div>
                            <Button
                                variant="gold"
                                onClick={() => {
                                    pots.forEach((_, i) => selectWinners(i, [autoWinner.id]));
                                    resolveShowdown();
                                    handleNextHand();
                                }}
                                className="w-full"
                                icon={<ArrowRight className="w-5 h-5" />}
                            >
                                Collect & Next Hand
                            </Button>
                        </div>
                    ) : (
                        <>
                            {!isShowdownResolved ? (
                                <div className="space-y-6 animate-in slide-in-from-bottom-5">
                                    <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {pots.map((pot, potIndex) => {
                                            const eligiblePlayers = getEligiblePlayersForPot(potIndex);
                                            if (eligiblePlayers.length <= 1) return null;

                                            return (
                                                <div key={potIndex} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm text-text-secondary uppercase tracking-wider">
                                                            {pots.length > 1 ? (potIndex === 0 ? 'Main Pot' : `Side Pot ${potIndex}`) : 'Pot'}
                                                        </span>
                                                        <span className="text-gold font-bold font-display">{pot.amount.toLocaleString()}</span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        {eligiblePlayers.map(player => {
                                                            const isSelected = selectedWinners.get(potIndex)?.includes(player.id);
                                                            return (
                                                                <button
                                                                    key={player.id}
                                                                    onClick={() => handlePlayerSelect(potIndex, player.id)}
                                                                    className={`
                                                                        px-4 py-2 rounded-lg font-bold text-sm transition-all
                                                                        ${isSelected
                                                                            ? 'bg-gold text-black shadow-[0_0_15px_rgba(255,215,0,0.3)] scale-105'
                                                                            : 'bg-black/40 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                                                        }
                                                                    `}
                                                                >
                                                                    {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                                                                    {player.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="electric" // Blue/Electric for "Decide"
                                        onClick={handleConfirmSelection}
                                        disabled={!canConfirm()}
                                        className="w-full"
                                        icon={<Check className="w-5 h-5" />}
                                    >
                                        Confirm Winner(s)
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in zoom-in-95">
                                    <div className="text-center p-8 bg-gold/5 rounded-2xl border border-gold/20 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

                                        <p className="text-gold/80 text-sm uppercase tracking-[0.2em] mb-4">Winner</p>
                                        <div className="flex flex-col gap-3">
                                            {winners.map(winner => (
                                                <div key={winner.id} className="text-4xl font-display font-bold text-white glow-text-gold">
                                                    {winner.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <Button
                                        variant="gold"
                                        onClick={handleNextHand}
                                        className="w-full"
                                        icon={<ArrowRight className="w-5 h-5" />}
                                    >
                                        Next Hand
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
}
