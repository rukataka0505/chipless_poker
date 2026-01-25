import React from 'react';
import { Player } from '@/lib/poker/types';
import { Card } from './ui/Card';

interface PlayerCardProps {
    player: Player;
    isActive: boolean;
    isDealer: boolean;
    position: string; // "SB", "BB", or ""
    onClick?: () => void;
    betType?: 'BET' | 'RAISE' | 'CALL';
}

export function PlayerCard({ player, isActive, isDealer, position, onClick, betType = 'BET' }: PlayerCardProps) {
    const isFolded = player.folded;
    const isAllIn = player.allIn;
    const hasBet = player.currentBet > 0;

    return (
        <div
            onClick={onClick}
            className={`
            relative transition-all duration-500 ease-out flex flex-col items-center cursor-pointer
            ${isActive ? 'scale-125 z-50' : 'scale-100 z-10'} 
            ${isFolded ? 'opacity-80' : 'opacity-100'}
        `}>
            {/* --- VARIANT B: Floating Satellite Pill for Bets --- */}
            <div className={`
                absolute -top-14 left-1/2 -translate-x-1/2 z-40
                transition-all duration-500 ease-out
                ${hasBet ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}
            `}>
                <div className="relative">
                    {/* Chip-like Pill - SHARP & CLEAN */}
                    <div className={`
                        border-2 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)]
                        ${betType === 'RAISE'
                            ? 'bg-gradient-to-b from-red-500 to-red-700 border-red-300'
                            : betType === 'CALL'
                                ? 'bg-gradient-to-b from-lime-400 to-lime-600 border-lime-200'
                                : 'bg-gradient-to-b from-yellow-400 to-yellow-600 border-yellow-200'
                        }
                    `}>
                        {/* Chip Icon */}
                        <div className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-inner
                            ${betType === 'RAISE'
                                ? 'border-red-900/50 bg-red-600'
                                : betType === 'CALL'
                                    ? 'border-lime-800/50 bg-lime-500'
                                    : 'border-yellow-800/50 bg-yellow-500'
                            }
                        `}>
                            <div className={`
                                w-3 h-3 rounded-full border border-dashed
                                ${betType === 'RAISE'
                                    ? 'border-red-900/60'
                                    : betType === 'CALL'
                                        ? 'border-lime-800/60'
                                        : 'border-yellow-800/60'
                                }
                            `} />
                        </div>

                        {/* Bet Amount */}
                        <span className="font-display font-bold text-xl text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] tabular-nums tracking-wider text-shadow-outline">
                            {player.currentBet.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Active Square Border Overlay - MOVED OUTSIDE CARD */}
            {/* Matches Card's rounded-[2rem] exactly */}
            {isActive && (
                <div className="absolute -inset-[3px] z-20 pointer-events-none border-[4px] border-red-600 animate-pulse rounded-[2rem] box-border shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
            )}

            <Card
                variant={isActive ? 'highlight' : 'default'}
                className={`
                    w-36 sm:w-44 transition-all duration-300 overflow-visible relative z-10
                    ${isActive
                        ? 'bg-black/90'
                        : 'bg-black/40'
                    }
                    ${isFolded ? 'bg-black/20 border-white/5' : ''}
                `}
            >
                {/* --- Position Badges (Inside Top Right) --- */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-50 pointer-events-none">
                    {/* Dealer Button */}
                    {isDealer && (
                        <div className="w-6 h-6 rounded-full bg-white text-black font-bold text-[10px] flex items-center justify-center shadow-lg border border-gray-300">
                            BTN
                        </div>
                    )}

                    {/* SB / BB Badge */}
                    {position && (
                        <div className={`
                            w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center shadow-lg border border-white/20
                            ${position === 'SB' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}
                        `}>
                            {position}
                        </div>
                    )}
                </div>

                <div className="p-4 flex flex-col items-center gap-1 mt-2">
                    {/* Name */}
                    <div className={`font-bold truncate w-full text-center ${isActive ? 'text-white text-lg' : 'text-gray-300 text-sm'} ${isFolded ? 'opacity-50' : ''}`}>
                        {player.name}
                    </div>

                    {/* Stack */}
                    <div className={`
                        font-display font-bold tracking-wide transition-all
                        ${isActive ? 'text-2xl text-red-500 glow-text-red' : 'text-xl text-white'}
                        ${isAllIn ? 'text-gold glow-text-gold animate-pulse' : ''}
                        ${isFolded ? 'opacity-50' : ''}
                    `}>
                        {player.stack.toLocaleString()}
                    </div>

                    {/* All In Label */}
                    {isAllIn && (
                        <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] border border-gold/30 px-2 py-0.5 rounded-full mt-1">
                            ALL IN
                        </span>
                    )}
                </div>

                {isFolded && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-red-500/80 font-bold uppercase tracking-[0.3em] text-sm border-y border-red-500/30 py-1 bg-black/40 backdrop-blur-[1px] px-4 rounded-full z-40">Fold</span>
                    </div>
                )}

            </Card>
        </div>
    );
}
