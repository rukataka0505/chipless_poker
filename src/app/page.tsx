'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Minus, Spade, Trophy, PlayCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { GAME_CONSTANTS } from '@/lib/poker/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SetupPage() {
    const router = useRouter();
    const { initializeGame, startNewHand } = useGameStore();

    const [playerCount, setPlayerCount] = useState(3);
    const [playerNames, setPlayerNames] = useState<string[]>([
        'Player 1', 'Player 2', 'Player 3',
        'Player 4', 'Player 5', 'Player 6',
        'Player 7', 'Player 8', 'Player 9'
    ]);
    const [initialStack, setInitialStack] = useState<string>(GAME_CONSTANTS.INITIAL_STACK.toString());

    const handlePlayerCountChange = (delta: number) => {
        const newCount = Math.max(GAME_CONSTANTS.MIN_PLAYERS, Math.min(GAME_CONSTANTS.MAX_PLAYERS, playerCount + delta));
        setPlayerCount(newCount);
    };

    const handleNameChange = (index: number, name: string) => {
        const newNames = [...playerNames];
        newNames[index] = name;
        setPlayerNames(newNames);
    };

    const handleStart = () => {
        const names = playerNames.slice(0, playerCount);
        const stack = parseInt(initialStack, 10) || GAME_CONSTANTS.INITIAL_STACK;
        initializeGame(names, stack);
        startNewHand();
        router.push('/game');
    };

    const handleStackChange = (val: string) => {
        if (/^\d*$/.test(val)) {
            setInitialStack(val);
        }
    };

    return (
        <main className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-electric/5 rounded-full" />
            </div>

            <div className="w-full max-w-md md:max-w-5xl space-y-8 z-10">
                {/* Header (Mobile) */}
                <div className="text-center space-y-2 md:hidden">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/5 mb-4 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                        <Spade className="w-12 h-12 text-gold" fill="currentColor" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                        どこでもポーカー
                    </h1>
                    <p className="text-text-tertiary">
                        手持ちのトランプで仲間とポーカーを楽しもう
                    </p>
                </div>                {/* Setup Card */}
                <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full">
                    {/* Header for Landscape (Visible on MD+) */}
                    <div className="hidden md:flex flex-col items-center justify-center p-8 text-center space-y-4 flex-1">
                        <div className="inline-flex items-center justify-center p-6 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/5 mb-4 shadow-[0_0_40px_rgba(255,215,0,0.15)]">
                            <Spade className="w-20 h-20 text-gold" fill="currentColor" />
                        </div>
                        <h1 className="text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 leading-tight">
                            どこでもポーカー
                        </h1>
                        <p className="text-text-tertiary">
                            手持ちのトランプで仲間とポーカーを楽しもう
                        </p>
                    </div>

                    <Card variant="highlight" className="p-6 sm:p-8 w-full md:max-w-xl">
                        <div className="space-y-6 sm:space-y-8">
                            {/* Player Count Control */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-text-secondary text-sm font-medium uppercase tracking-wider">
                                    <Users className="w-4 h-4 text-electric" />
                                    プレイヤー数
                                </label>

                                <div className="flex items-center justify-between bg-black/20 rounded-2xl p-2 border border-white/5">
                                    <button
                                        onClick={() => handlePlayerCountChange(-1)}
                                        disabled={playerCount <= GAME_CONSTANTS.MIN_PLAYERS}
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>

                                    <span className="text-4xl font-display font-bold text-electric glow-text-electric">
                                        {playerCount}
                                    </span>

                                    <button
                                        onClick={() => handlePlayerCountChange(1)}
                                        disabled={playerCount >= GAME_CONSTANTS.MAX_PLAYERS}
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Initial Stack */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-text-secondary text-sm font-medium uppercase tracking-wider">
                                    <Trophy className="w-4 h-4 text-gold" />
                                    開始スタック
                                </label>
                                <input
                                    type="text"
                                    value={initialStack}
                                    onChange={(e) => handleStackChange(e.target.value)}
                                    className="w-full bg-black/20 border border-white/5 rounded-2xl py-3 px-4 text-center text-2xl font-display font-bold text-gold placeholder-gold/30 focus:outline-none focus:bg-black/30 focus:border-gold/30 transition-all glow-text-gold"
                                />
                            </div>

                            {/* Player Names */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[240px] sm:max-h-none overflow-y-auto pr-1 sm:pr-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {Array.from({ length: playerCount }).map((_, index) => (
                                    <div key={index} className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <div className="w-2 h-2 rounded-full bg-gold/50 group-focus-within:bg-gold group-focus-within:shadow-[0_0_8px_var(--accent-gold)] transition-all" />
                                        </div>
                                        <input
                                            type="text"
                                            value={playerNames[index]}
                                            onChange={(e) => handleNameChange(index, e.target.value)}
                                            placeholder={`Player ${index + 1}`}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-gold/50 transition-all font-medium text-sm"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Game Settings Summary */}
                            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gold/5 border border-gold/10">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gold/70 uppercase tracking-wide">開始スタック</span>
                                    <span className="font-display font-bold text-gold">{parseInt(initialStack, 10) || 0}</span>
                                </div>
                                <div className="w-px h-8 bg-gold/20" />
                                <div className="flex flex-col text-right">
                                    <span className="text-xs text-gold/70 uppercase tracking-wide">ブラインド</span>
                                    <span className="font-display font-bold text-gold">{GAME_CONSTANTS.SMALL_BLIND} / {GAME_CONSTANTS.BIG_BLIND}</span>
                                </div>
                            </div>

                            <Button
                                variant="gold"
                                size="xl"
                                className="w-full"
                                onClick={handleStart}
                                icon={<Trophy className="w-5 h-5" />}
                            >
                                ゲームを開始
                            </Button>
                        </div>
                    </Card>
                </div>

                <p className="text-center text-xs text-text-tertiary md:hidden">
                    © 2026 どこでもポーカー. 手持ちのトランプで仲間とポーカーを楽しもう
                </p>
            </div>
        </main>
    );
}
