import React from 'react';
import { Player } from '@/lib/poker/types';
import { Card } from './ui/Card';

interface PlayerCardProps {
    player: Player;
    isActive: boolean;
    isDealer: boolean;
    position: string; // "SB", "BB", or ""
}

export function PlayerCard({ player, isActive, isDealer, position }: PlayerCardProps) {
    const isFolded = player.folded;
    const isAllIn = player.allIn;
    const hasBet = player.currentBet > 0;

    return (
        <div className={`
            relative transition-all duration-500 ease-out 
            ${isActive ? 'scale-125 z-50' : 'scale-100 z-10'} 
            ${isFolded ? 'opacity-40 grayscale blur-[1px]' : 'opacity-100'}
        `}>
            {/* --- VARIANT B: Floating Satellite Pill for Bets --- */}
            {/* Absolute positioned above the card so it doesn't shift the card's center */}
            <div className={`
                absolute -top-14 left-1/2 -translate-x-1/2 z-40
                transition-all duration-500 ease-out
                ${hasBet ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-90 pointer-events-none'}
            `}>
                <div className="relative">
                    {/* Chip-like Pill */}
                    <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 border-2 border-yellow-200 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                        {/* Chip Icon / Illustration */}
                        <div className="w-5 h-5 rounded-full border-2 border-yellow-800/50 bg-yellow-500 flex items-center justify-center shadow-inner">
                            <div className="w-3 h-3 rounded-full border border-dashed border-yellow-800/60" />
                        </div>

                        <span className="font-display font-bold text-xl text-black drop-shadow-sm tabular-nums">
                            {player.currentBet.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>


            {/* Active Glow Background - Stronger */}
            {isActive && (
                <>
                    <div className="absolute inset-0 bg-electric/40 rounded-3xl blur-2xl animate-pulse-slow pointer-events-none" />
                    <div className="absolute -inset-4 bg-electric/10 rounded-full blur-3xl animate-pulse-slow pointer-events-none" style={{ animationDelay: '0.5s' }} />
                </>
            )}

            {/* Dealer Button */}
            {isDealer && (
                <div className="absolute -top-4 -right-3 z-30 w-7 h-7 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.5)] border-2 border-gray-200">
                    D
                </div>
            )}

            {/* Position Badges */}
            {position && (
                <div className="absolute -top-4 -left-3 z-30 px-2.5 h-6 rounded-full bg-gold text-black font-bold text-xs flex items-center justify-center shadow-[0_0_10px_rgba(255,215,0,0.5)] uppercase tracking-wider border border-white/20">
                    {position}
                </div>
            )}

            <Card
                variant={isActive ? 'highlight' : 'default'}
                className={`
                    w-36 sm:w-44 transition-all duration-300 overflow-visible
                    ${isActive ? 'ring-2 ring-electric shadow-[0_0_40px_rgba(0,240,255,0.5)] bg-black/80' : 'bg-black/40'}
                    ${isFolded ? 'bg-black/20 border-white/5' : ''}
                `}
            >
                <div className="p-4 flex flex-col items-center gap-1">
                    {/* Name */}
                    <div className={`font-bold truncate w-full text-center ${isActive ? 'text-white text-lg' : 'text-gray-300 text-sm'}`}>
                        {player.name}
                    </div>

                    {/* Stack */}
                    <div className={`
                        font-display font-bold tracking-wide transition-all
                        ${isActive ? 'text-2xl text-electric glow-text-electric' : 'text-xl text-white'}
                        ${isAllIn ? 'text-gold glow-text-gold animate-pulse' : ''}
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-3xl">
                        <span className="text-red-500/80 font-bold uppercase tracking-[0.3em] text-sm border-y border-red-500/30 py-1">Fold</span>
                    </div>
                )}
            </Card>
        </div>
    );
}
