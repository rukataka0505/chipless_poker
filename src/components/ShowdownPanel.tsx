'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Users, Check, ArrowRight, Undo2 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export function ShowdownPanel() {
    const {
        phase,
        pots,
        players,
        selectedWinners,
        selectWinners,
        resolveShowdown,
        proceedToNextHand,
        undo,
        canUndo,
        isShowdownResolved,
    } = useGameStore();

    // const [isResolved, setIsResolved] = useState(false);

    const activePlayers = players.filter(p => !p.folded);

    // 1人しか残っていない場合は自動で勝者
    const autoWinner = activePlayers.length === 1 ? activePlayers[0] : null;

    // 各ポットの参加資格があるプレイヤー（フォールドしていない）を計算
    const getEligiblePlayersForPot = (potIndex: number) => {
        const pot = pots[potIndex];
        if (!pot) return [];
        return pot.eligiblePlayerIds
            .map(id => players.find(p => p.id === id))
            .filter(p => p && !p.folded) as typeof players;
    };

    // 1人しか選択肢のないポットを自動選択
    useEffect(() => {
        if (phase !== 'SHOWDOWN' || isShowdownResolved || autoWinner) return;

        pots.forEach((pot, potIndex) => {
            const eligiblePlayers = getEligiblePlayersForPot(potIndex);
            // 1人しか参加資格がない場合、自動選択
            if (eligiblePlayers.length === 1) {
                const currentWinners = selectedWinners.get(potIndex);
                const singlePlayerId = eligiblePlayers[0].id;
                // まだ選択されていない場合のみ選択
                if (!currentWinners || !currentWinners.includes(singlePlayerId)) {
                    selectWinners(potIndex, [singlePlayerId]);
                }
            }
        });
    }, [phase, pots, players, isShowdownResolved, autoWinner]);

    if (phase !== 'SHOWDOWN') {
        return null;
    }

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

    const handleConfirmSelection = () => {
        if (autoWinner) {
            // 自動勝者の場合、全ポットをその人にセット（念のため）
            pots.forEach((_, i) => {
                selectWinners(i, [autoWinner.id]);
            });
        }

        // チップ配分を実行
        resolveShowdown();
        // setIsResolved(true); // ストア側で更新されるため不要
    };

    const handleNextHand = () => {
        // setIsResolved(false); // 次のハンドでリセットされるため不要
        proceedToNextHand();
    };

    // AutoWinnerの場合、最初から解決済みとして扱わず、ボタンで解決させるか？
    // ユーザー要望の「ワンクッション」に従い、
    // AutoWinnerでも「決定」->「結果（スタック増）」->「次へ」とするか、
    // あるいはAutoWinnerは「次へ」だけで済ませるか。
    // ここではAutoWinnerは「決定（自動）」扱いで、最初から選択画面をスキップして結果画面を表示するが、
    // まだresolveされていない状態（スタック増もまだ）とする。
    // -> AutoWinnerの場合も isResolved フラグで管理する。

    // UI表示ロジック
    // 1. AutoWinnerあり -> 最初から「勝者：○○」表示。ボタンは「決定（賞金受取）」→「次へ」
    // 2. AutoWinnerなし -> 「勝者選択」 -> 「決定」 -> 「勝者：○○」 -> 「次へ」

    // 簡略化のため、AutoWinnerがいる場合は「決定」ステップをスキップして、
    // いきなり「結果表示＆チップ配分済み」にしたいが、
    // resolveShowdownを呼ばないとチップが増えない。
    // なので、AutoWinnerの場合も「結果表示（未解決）」-> ボタン「確定」->「結果表示（解決済）」->「次へ」
    // だと手間が多い。

    // 修正方針：
    // AutoWinnerの場合：
    //   UI: 「勝者：○○」
    //   ボタン: 「次のゲームに進む」
    //   クリック動作: resolveShowdown() して proceedToNextHand() を一気に行う（既存通り）

    // 通常の場合：
    //   UI(isResolved=false): 勝者選択
    //   ボタン: 「決定」
    //   クリック動作: resolveShowdown() し、isResolved=true に
    //
    //   UI(isResolved=true): 「勝者：○○」
    //   ボタン: 「次のゲームに進む」
    //   クリック動作: proceedToNextHand()

    const isAutoWinnerMode = !!autoWinner;
    const showResultScreen = isShowdownResolved || isAutoWinnerMode;

    // AutoWinnerの場合、ワンクッション置くなら「既存の画面」でOK。
    // 「次へ」ボタンで一括処理。

    // 通常時のResult画面用のデータ準備
    const getWinnersList = () => {
        // 全ポットの勝者を集約
        const allWinnerIds = new Set<string>();
        pots.forEach((_, i) => {
            const ids = selectedWinners.get(i);
            ids?.forEach(id => allWinnerIds.add(id));
        });
        return players.filter(p => allWinnerIds.has(p.id));
    };

    const winners = getWinnersList();

    return (
        <div className="glass-panel rounded-2xl p-4 mt-4 animate-slide-up">
            <div className="relative flex justify-center items-center mb-4">
                {/* 戻るボタン */}
                <div className="absolute left-0 top-0 z-10">
                    <button
                        onClick={() => undo()}
                        disabled={!canUndo()}
                        className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all border ${canUndo()
                            ? 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600 shadow-sm'
                            : 'bg-black/20 text-gray-600 border-transparent cursor-not-allowed'
                            }`}
                    >
                        <Undo2 size={18} />
                        <span className="text-xs font-bold">UNDO</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <h2 className="text-xl font-bold">ショーダウン</h2>
                </div>
            </div>

            {/* 自動勝者（AutoWinner）の場合は既存通りの表示で、ボタンで一括処理 */}
            {isAutoWinnerMode ? (
                <>
                    <div className="text-center mb-6">
                        <p className="text-gray-400 mb-2">他プレイヤー全員フォールド</p>
                        <div className="bg-yellow-500/20 rounded-xl p-4">
                            <p className="text-2xl font-bold text-yellow-400">{autoWinner.name}</p>
                            <p className="text-gray-300">が勝利しました！</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            // AutoWinnerの一括処理
                            pots.forEach((_, i) => selectWinners(i, [autoWinner.id]));
                            resolveShowdown();
                            handleNextHand();
                        }}
                        className="w-full py-4 rounded-xl font-bold text-lg bg-green-600 hover:bg-green-500 text-white transition-all"
                    >
                        次のゲームに進む
                    </button>
                </>
            ) : (
                /* 通常ショーダウン */
                <>
                    {!isShowdownResolved ? (
                        /* 勝者選択画面 */
                        <>
                            <div className="space-y-4 mb-6">
                                {pots.map((pot, potIndex) => {
                                    // 1人しか参加資格がないポットは表示しない（自動選択される）
                                    const eligiblePlayers = getEligiblePlayersForPot(potIndex);
                                    if (eligiblePlayers.length <= 1) {
                                        return null;
                                    }

                                    return (
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
                                                {eligiblePlayers.map(player => {
                                                    const isSelected = selectedWinners.get(potIndex)?.includes(player.id);

                                                    return (
                                                        <button
                                                            key={player.id}
                                                            onClick={() => handlePlayerSelect(potIndex, player.id)}
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
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleConfirmSelection}
                                disabled={!canConfirm()}
                                className={`
                                    w-full py-4 rounded-xl font-bold text-lg transition-all
                                    ${canConfirm()
                                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }
                                `}
                            >
                                決定
                            </button>
                        </>
                    ) : (
                        /* 勝者結果画面（Result Screen） */
                        <div className="animate-fade-in">
                            <div className="text-center mb-6">
                                <div className="bg-yellow-500/20 rounded-xl p-6">
                                    <p className="text-gray-300 mb-4">WINNER</p>
                                    <div className="flex flex-col gap-2">
                                        {winners.map(winner => (
                                            <div key={winner.id} className="text-2xl font-bold text-yellow-400">
                                                {winner.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleNextHand}
                                className="w-full py-4 rounded-xl font-bold text-lg bg-green-600 hover:bg-green-500 text-white transition-all flex items-center justify-center gap-2"
                            >
                                次のゲームに進む
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
