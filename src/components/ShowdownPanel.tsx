'use client';

import React from 'react';
import { Trophy, Users, Check } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export function ShowdownPanel() {
    const {
        phase,
        pots,
        players,
        selectedWinners,
        selectWinners,
        confirmShowdown,
        startNewHand,
    } = useGameStore();

    if (phase !== 'SHOWDOWN') {
        return null;
    }

    const activePlayers = players.filter(p => !p.folded);

    // 1人しか残っていない場合は自動で勝者
    const autoWinner = activePlayers.length === 1 ? activePlayers[0] : null;

    const handlePlayerSelect = (potIndex: number, playerId: string) => {
        const currentWinners = selectedWinners.get(potIndex) || [];

        if (currentWinners.includes(playerId)) {
            // 選択解除
            selectWinners(potIndex, currentWinners.filter(id => id !== playerId));
        } else {
            // 選択追加（チョップ対応）
            selectWinners(potIndex, [...currentWinners, playerId]);
        }
    };

    const canConfirm = () => {
        if (autoWinner) return true;
        // 全ポットで少なくとも1人の勝者が選択されているか
        return pots.every((_, i) => {
            const winners = selectedWinners.get(i);
            return winners && winners.length > 0;
        });
    };

    const handleConfirm = () => {
        if (autoWinner) {
            // 自動勝者の場合、全ポットをその人に
            pots.forEach((_, i) => {
                selectWinners(i, [autoWinner.id]);
            });
        }
        confirmShowdown();
        startNewHand();
    };

    return (
        <div className="glass-panel rounded-2xl p-4 mt-4 animate-slide-up">
            <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold">ショーダウン</h2>
            </div>

            {autoWinner ? (
                /* 自動勝者表示 */
                <div className="text-center mb-6">
                    <p className="text-gray-400 mb-2">他プレイヤー全員フォールド</p>
                    <div className="bg-yellow-500/20 rounded-xl p-4">
                        <p className="text-2xl font-bold text-yellow-400">{autoWinner.name}</p>
                        <p className="text-gray-300">が勝利しました！</p>
                    </div>
                </div>
            ) : (
                /* ポット別勝者選択 */
                <div className="space-y-4 mb-6">
                    {pots.map((pot, potIndex) => (
                        <div key={potIndex} className="bg-white/5 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-400">
                                    {pots.length > 1 ? (potIndex === 0 ? 'メインポット' : `サイドポット ${potIndex}`) : 'ポット'}
                                </span>
                                <span className="text-yellow-400 font-bold">{pot.amount}</span>
                            </div>

                            <p className="text-xs text-gray-400 mb-2">
                                <Users className="w-3 h-3 inline mr-1" />
                                勝者を選択（複数可：チョップ）
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {pot.eligiblePlayerIds.map(playerId => {
                                    const player = players.find(p => p.id === playerId);
                                    if (!player || player.folded) return null;

                                    const isSelected = selectedWinners.get(potIndex)?.includes(playerId);

                                    return (
                                        <button
                                            key={playerId}
                                            onClick={() => handlePlayerSelect(potIndex, playerId)}
                                            className={`
                        px-4 py-2 rounded-lg font-medium transition-all
                        ${isSelected
                                                    ? 'bg-yellow-500 text-black'
                                                    : 'bg-gray-700 text-white hover:bg-gray-600'
                                                }
                      `}
                                        >
                                            {isSelected && <Check className="w-4 h-4 inline mr-1" />}
                                            {player.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 確定ボタン */}
            <button
                onClick={handleConfirm}
                disabled={!canConfirm()}
                className={`
          w-full py-4 rounded-xl font-bold text-lg transition-all
          ${canConfirm()
                        ? 'bg-green-600 hover:bg-green-500 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }
        `}
            >
                次のゲームに進む
            </button>
        </div>
    );
}
