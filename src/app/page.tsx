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
        'Player 4', 'Player 5', 'Player 6'
    ]);

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
        initializeGame(names);
        startNewHand();
        router.push('/game');
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-electric/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
            </div>

            <div className="w-full max-w-md space-y-8 z-10">
                {/* Header */}
                <div className="text-center space-y-2 animate-float">
                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/5 mb-4 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                        <Spade className="w-12 h-12 text-gold" fill="currentColor" />
                    </div>
                    <h1 className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                        Chipless<br />Poker
                    </h1>
                    <p className="text-text-secondary tracking-widest text-sm uppercase">Midnight Luxe Edition</p>
                </div>

                {/* Setup Card */}
                <Card variant="highlight" className="p-8 backdrop-blur-xl">
                    <div className="space-y-8">
                        {/* Player Count Control */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-text-secondary text-sm font-medium uppercase tracking-wider">
                                <Users className="w-4 h-4 text-electric" />
                                Players
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

                        {/* Player Names */}
                        <div className="space-y-3">
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
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder-gray-600 focus:outline-none focus:bg-white/10 focus:border-gold/50 transition-all font-medium"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Game Settings Summary */}
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gold/5 border border-gold/10">
                            <div className="flex flex-col">
                                <span className="text-xs text-gold/70 uppercase tracking-wide">Starting Stack</span>
                                <span className="font-display font-bold text-gold">{GAME_CONSTANTS.INITIAL_STACK.toLocaleString()}</span>
                            </div>
                            <div className="w-px h-8 bg-gold/20" />
                            <div className="flex flex-col text-right">
                                <span className="text-xs text-gold/70 uppercase tracking-wide">Blinds</span>
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
                            Start Game
                        </Button>
                    </div>
                </Card>

                <p className="text-center text-xs text-text-tertiary">
                    © 2026 Chipless Poker. No physical chips required.
                </p>
            </div>
        </main>
    );
}
