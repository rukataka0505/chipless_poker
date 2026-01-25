'use client';

import React from 'react';
import { Coins } from 'lucide-react';
import { Player } from '@/lib/poker/types';

interface PlayerCardProps {
    player: Player;
    isActive: boolean;
}

export function PlayerCard({ player, isActive }: PlayerCardProps) {
    const { name, stack, currentBet, position, folded, allIn } = player;

    return (
        <div
            className={`
        player-card relative text-center transition-all duration-300
        ${isActive ? 'active active-glow w-24 scale-100' : 'w-16 scale-90'}
        ${folded ? 'folded' : ''}
        ${allIn ? 'bg-red-900/50' : 'glass-panel'}
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
                {allIn && <span className="text-red-400 ml-1">ALL IN</span>}
                {folded && <span className="text-gray-500 ml-1">FOLD</span>}
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
