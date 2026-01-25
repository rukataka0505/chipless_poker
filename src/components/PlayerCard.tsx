import React from 'react';
import { User, Trophy, EyeOff } from 'lucide-react';
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

    return (
        <div className={`relative transition-all duration-300 ${isActive ? 'scale-110 z-10' : 'scale-100 z-0'} ${isFolded ? 'opacity-50 grayscale' : 'opacity-100'}`}>
            {/* Dealer Button */}
            {isDealer && (
                <div className="absolute -top-3 -right-2 z-20 w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shadow-lg border border-gray-300">
                    D
                </div>
            )}

            {/* Position Badges */}
            {position && (
                <div className="absolute -top-3 -left-2 z-20 px-2 h-5 rounded-full bg-gold text-black font-bold text-[10px] flex items-center justify-center shadow-lg uppercase tracking-wider">
                    {position}
                </div>
            )}

            <Card
                variant={isActive ? 'highlight' : 'default'}
                className={`
                    w-32 sm:w-40 p-3 flex flex-col items-center gap-2
                    ${isActive ? 'ring-2 ring-electric/50 shadow-[0_0_30px_rgba(0,240,255,0.2)]' : ''}
                    ${isFolded ? 'bg-black/40 border-white/5' : ''}
                `}
            >
                {/* Avatar */}
                <div className={`
                    relative w-12 h-12 rounded-full flex items-center justify-center border-2 
                    ${isActive ? 'border-electric bg-electric/10' : isFolded ? 'border-gray-700 bg-gray-800' : 'border-gold/30 bg-gold/5'}
                    transition-colors duration-300
                `}>
                    {isFolded ? (
                        <EyeOff className="w-5 h-5 text-gray-500" />
                    ) : isAllIn ? (
                        <Trophy className="w-5 h-5 text-gold animate-pulse" />
                    ) : (
                        <User className={`w-6 h-6 ${isActive ? 'text-electric' : 'text-gold/70'}`} />
                    )}
                </div>

                {/* Info */}
                <div className="text-center w-full">
                    <div className="text-xs font-bold truncate text-white/90 mb-0.5">
                        {player.name}
                    </div>
                    <div className={`
                        font-display font-bold text-sm tracking-wide
                        ${isAllIn ? 'text-gold glow-text-gold' : 'text-white'}
                    `}>
                        {player.stack.toLocaleString()}
                    </div>
                </div>

                {/* Status or Bet */}
                {player.currentBet > 0 && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-gold/30 text-gold px-3 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                        {player.currentBet.toLocaleString()}
                    </div>
                )}

                {isFolded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-3xl">
                        <span className="text-red-500 font-bold uppercase tracking-widest text-xs border border-red-500/50 px-2 py-1 rounded">Fold</span>
                    </div>
                )}
            </Card>
        </div>
    );
}
