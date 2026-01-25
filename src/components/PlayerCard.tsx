'use client';

import React from 'react';
import { Coins } from 'lucide-react';
import { Player } from '@/lib/poker/types';

interface PlayerCardProps {
    player: Player;
    isActive: boolean;
    onClick?: () => void;
}

export function PlayerCard({ player, isActive, onClick }: PlayerCardProps) {
    const { name, stack, currentBet, position, folded, allIn } = player;

    return (
        <div
            onClick={onClick}
            className={`
        player-card relative text-center transition-all duration-300 font-sans
        ${isActive
                    ? 'active active-glow w-24 scale-100 bg-black border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] z-20'
                    : 'w-16 scale-95 bg-gray-900/90 border border-white/20 shadow-lg z-10'}
        ${folded ? 'folded opacity-50 bg-gray-950 border-gray-800' : ''}
        ${allIn ? '!bg-red-900/80 !border-red-500' : ''}
        ${onClick ? 'cursor-pointer hover:scale-105 hover:border-yellow-500/50' : ''}
      `}
        >
            {/* ポジションバッジ */}
            {position && (
                <div
                    className={`
            position-badge
            ${position === 'D' ? 'badge-dealer' : ''}
            ${position === 'SB' ? 'badge-sb' : ''}
            ${position === 'BB' ? 'badge-bb' : ''}
          `}
                >
                    {position}
                </div>
            )}



            {/* プレイヤー名 */}
            <p className={`font-bold mb-0.5 transition-all duration-300 break-words leading-tight ${isActive ? 'text-xs' : 'text-[10px]'}`}>
                {name}
                {!allIn && stack === 0 && <span className="text-red-600 font-extrabold ml-1">BUST</span>}
                {allIn && <span className="text-red-400 ml-1">ALL IN</span>}
                {folded && stack > 0 && <span className="text-gray-500 ml-1">FOLD</span>}
            </p>

            {/* スタック */}
            <div className={`flex items-center justify-center gap-1 ${isActive ? 'text-xs' : 'text-[10px]'}`}>
                <Coins className={`text-yellow-400 ${isActive ? 'w-3 h-3' : 'w-2.5 h-2.5'}`} />
                <span className="text-yellow-400 font-medium">{stack}</span>
            </div>

            {/* 現在のベット額 - TableViewで表示するため非表示
            {currentBet > 0 && (
                <div className="mt-2 bg-green-600/80 rounded-full px-2 py-0.5 text-xs font-bold">
                    BET: {currentBet}
                </div>
            )}
            */}
        </div>
    );
}
