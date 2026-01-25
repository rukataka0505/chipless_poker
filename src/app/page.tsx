'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Minus, Play, Spade } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { GAME_CONSTANTS } from '@/lib/poker/types';

export default function SetupPage() {
    const router = useRouter();
    const { initializeGame, startNewHand } = useGameStore();

    const [playerCount, setPlayerCount] = useState(3);
    const [playerNames, setPlayerNames] = useState<string[]>([
        'プレイヤー1', 'プレイヤー2', 'プレイヤー3',
        'プレイヤー4', 'プレイヤー5', 'プレイヤー6'
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
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            {/* ロゴ・タイトル */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Spade className="w-12 h-12 text-white" />
                    <h1 className="text-4xl font-bold text-white">
                        Chipless Poker
                    </h1>
                </div>
                <p className="text-gray-300">物理チップ不要のポーカーチップ管理</p>
            </div>

            {/* 設定パネル */}
            <div className="glass-panel rounded-3xl p-6 w-full max-w-md">
                {/* 人数選択 */}
                <div className="mb-6">
                    <label className="flex items-center gap-2 text-gray-300 mb-3">
                        <Users className="w-5 h-5" />
                        プレイヤー人数
                    </label>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => handlePlayerCountChange(-1)}
                            disabled={playerCount <= GAME_CONSTANTS.MIN_PLAYERS}
                            className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${playerCount <= GAME_CONSTANTS.MIN_PLAYERS
                                    ? 'bg-gray-700 text-gray-500'
                                    : 'bg-gray-600 hover:bg-gray-500 text-white'}
              `}
                        >
                            <Minus className="w-6 h-6" />
                        </button>

                        <span className="text-5xl font-bold text-yellow-400 w-16 text-center">
                            {playerCount}
                        </span>

                        <button
                            onClick={() => handlePlayerCountChange(1)}
                            disabled={playerCount >= GAME_CONSTANTS.MAX_PLAYERS}
                            className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${playerCount >= GAME_CONSTANTS.MAX_PLAYERS
                                    ? 'bg-gray-700 text-gray-500'
                                    : 'bg-gray-600 hover:bg-gray-500 text-white'}
              `}
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* プレイヤー名入力 */}
                <div className="mb-6">
                    <label className="text-gray-300 mb-3 block">プレイヤー名</label>

                    <div className="space-y-2">
                        {Array.from({ length: playerCount }).map((_, index) => (
                            <input
                                key={index}
                                type="text"
                                value={playerNames[index]}
                                onChange={(e) => handleNameChange(index, e.target.value)}
                                placeholder={`プレイヤー${index + 1}`}
                                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
                            />
                        ))}
                    </div>
                </div>

                {/* ゲーム設定表示 */}
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                    <h3 className="text-sm text-gray-400 mb-2">ゲーム設定</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-400">初期スタック:</span>
                            <span className="text-white font-medium">{GAME_CONSTANTS.INITIAL_STACK}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">SB / BB:</span>
                            <span className="text-white font-medium">{GAME_CONSTANTS.SMALL_BLIND} / {GAME_CONSTANTS.BIG_BLIND}</span>
                        </div>
                    </div>
                </div>

                {/* スタートボタン */}
                <button
                    onClick={handleStart}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-4 rounded-xl text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Play className="w-6 h-6" />
                    ゲーム開始
                </button>
            </div>

            {/* フッター */}
            <p className="text-gray-500 text-xs mt-8">
                ノーリミット・テキサスホールデム
            </p>
        </div>
    );
}
