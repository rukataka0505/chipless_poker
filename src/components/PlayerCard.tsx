import React from 'react';
import { Player } from '@/lib/poker/types';
import { Card } from './ui/Card';

interface PlayerCardProps {
    player: Player;
    isActive: boolean;
    isDealer: boolean;
    position: string; // "SB", "BB", or ""
    onClick?: () => void;
    betType?: 'BET' | 'RAISE' | 'CALL' | 'CHECK';
    isShowdown?: boolean;       // Showdown phase active
    isContestingPot?: boolean;   // Player is involved in the pot (not folded)
}

export function PlayerCard({
    player,
    isActive,
    isDealer,
    position,
    onClick,
    betType = 'BET',
    isShowdown = false,
    isContestingPot = false
}: PlayerCardProps) {
    const isFolded = player.folded;
    const isAllIn = player.allIn;
    const hasBet = player.currentBet > 0;
    const showIndicator = hasBet || betType === 'CHECK';

    // Sticky state to hold previous values during fade-out
    const [displayBetType, setDisplayBetType] = React.useState(betType);
    const [displayBetAmount, setDisplayBetAmount] = React.useState(player.currentBet);

    React.useEffect(() => {
        if (showIndicator) {
            setDisplayBetType(betType);
            setDisplayBetAmount(player.currentBet);
        }
    }, [showIndicator, betType, player.currentBet]);

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
                absolute -top-10 sm:-top-14 left-1/2 -translate-x-1/2 z-40
                transition-all duration-500 ease-out
                ${showIndicator ? 'opacity-100 translate-y-0 scale-90 sm:scale-100' : 'opacity-0 translate-y-4 scale-75 sm:scale-90 pointer-events-none'}
            `}>
                <div className="relative">
                    {/* Chip-like Pill - SHARP & CLEAN */}
                    <div className={`
                        border-2 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_4px_10px_rgba(0,0,0,0.5)]
                        ${displayBetType === 'RAISE'
                            ? 'bg-gradient-to-b from-red-500 to-red-700 border-red-300'
                            : displayBetType === 'CALL'
                                ? 'bg-gradient-to-b from-lime-400 to-lime-600 border-lime-200'
                                : displayBetType === 'CHECK'
                                    ? 'bg-gradient-to-b from-cyan-400 to-cyan-600 border-cyan-200'
                                    : 'bg-gradient-to-b from-yellow-400 to-yellow-600 border-yellow-200'
                        }
                    `}>
                        {/* Chip Icon */}
                        <div className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center shadow-inner
                            ${displayBetType === 'RAISE'
                                ? 'border-red-900/50 bg-red-600'
                                : displayBetType === 'CALL'
                                    ? 'border-lime-800/50 bg-lime-500'
                                    : displayBetType === 'CHECK'
                                        ? 'border-cyan-800/50 bg-cyan-500'
                                        : 'border-yellow-800/50 bg-yellow-500'
                            }
                        `}>
                            <div className={`
                                w-3 h-3 rounded-full border border-dashed
                                ${displayBetType === 'RAISE'
                                    ? 'border-red-900/60'
                                    : displayBetType === 'CALL'
                                        ? 'border-lime-800/60'
                                        : displayBetType === 'CHECK'
                                            ? 'border-cyan-800/60'
                                            : 'border-yellow-800/60'
                                }
                            `} />
                        </div>

                        {/* Bet Amount */}
                        {displayBetType === 'CHECK' ? (
                            <span className="font-display font-bold text-xl text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] tracking-wider text-shadow-outline">
                                CHECK
                            </span>
                        ) : (
                            <div className="flex items-baseline gap-1.5 ml-1">
                                <span className="font-bold text-xs text-white/90 drop-shadow-[0_1px_0_rgba(0,0,0,0.8)] tracking-wider text-shadow-outline self-center">
                                    {displayBetType}
                                </span>
                                <span className="font-display font-bold text-2xl text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.8)] tabular-nums tracking-wider text-shadow-outline -my-1">
                                    {displayBetAmount.toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Square Border Overlay - MOVED OUTSIDE CARD */}
            {/* Matches Card's rounded-[2rem] exactly */}
            {/* Showdown Highlight (Gold) */}
            {isShowdown && isContestingPot && (
                <div className="absolute -inset-[3px] z-20 pointer-events-none border-[4px] border-gold animate-pulse rounded-[2rem] box-border shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
            )}

            {/* Active Highlight (Red) - Only show if NOT Showdown */}
            {
                isActive && !isShowdown && (
                    <div className="absolute -inset-[3px] z-20 pointer-events-none border-[4px] border-red-600 animate-pulse rounded-[2rem] box-border shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
                )
            }

            <Card
                variant={(isActive || (isShowdown && isContestingPot)) ? 'highlight' : 'default'}
                className={`
            w-28 sm:w-36 lg:w-44 transition-all duration-300 overflow-visible relative z-10
            ${(isActive || (isShowdown && isContestingPot))
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
                    <div className={`font-bold truncate w-full text-center ${isActive ? 'text-base sm:text-lg text-white' : 'text-xs sm:text-base text-gray-300'} ${isFolded ? 'opacity-50' : ''}`}>
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
        </div >
    );
}
