'use client';

import React, { useState } from 'react';
import { X, Check, ArrowUp, Minus } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { PlayerAction } from '@/lib/poker/types';

export function ActionPanel() {
    const {
        phase,
        getCurrentPlayer,
        getAvailableActionsForCurrentPlayer,
        doAction,
        currentBet,
    } = useGameStore();

    const [betAmount, setBetAmount] = useState<string>('');
    const [showNumpad, setShowNumpad] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentPlayer = getCurrentPlayer();
    const availableActions = getAvailableActionsForCurrentPlayer();

    if (!currentPlayer || !availableActions || phase === 'SETUP' || phase === 'SHOWDOWN') {
        return null;
    }

    const handleAction = (action: PlayerAction, amount?: number) => {
        setError(null);
        const result = doAction(action, amount);
        if (!result.success) {
            setError(result.error || 'エラーが発生しました');
        } else {
            setBetAmount('');
            setShowNumpad(false);
        }
    };

    const handleNumpadInput = (value: string) => {
        if (value === 'clear') {
            setBetAmount('');
        } else if (value === 'back') {
            setBetAmount(prev => prev.slice(0, -1));
        } else {
            setBetAmount(prev => prev + value);
        }
    };

    const handleBetConfirm = () => {
        const amount = parseInt(betAmount, 10);
        if (isNaN(amount)) {
            setError('金額を入力してください');
            return;
        }

        const action: PlayerAction = currentBet === 0 ? 'BET' : 'RAISE';
        handleAction(action, amount);
    };

    return (
        <div className="glass-panel rounded-2xl p-4 mt-4 animate-slide-up">
            {/* 現在のプレイヤー表示 */}
            <div className="text-center mb-4">
                <p className="text-sm text-gray-400">アクション中</p>
                <p className="text-xl font-bold text-yellow-400">{currentPlayer.name}</p>
                <p className="text-sm text-gray-300">
                    スタック: <span className="text-yellow-400">{currentPlayer.stack}</span>
                    {currentBet > 0 && (
                        <span className="ml-2">
                            コール額: <span className="text-green-400">{availableActions.callAmount}</span>
                        </span>
                    )}
                </p>
            </div>

            {/* エラー表示 */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-2 mb-4 text-center text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* アクションボタン */}
            {!showNumpad ? (
                <div className="grid grid-cols-3 gap-3">
                    {/* FOLD */}
                    <button
                        onClick={() => handleAction('FOLD')}
                        className="btn-action btn-fold flex flex-col items-center"
                    >
                        <X className="w-6 h-6 mb-1" />
                        <span>FOLD</span>
                    </button>

                    {/* CHECK / CALL */}
                    {availableActions.canCheck ? (
                        <button
                            onClick={() => handleAction('CHECK')}
                            className="btn-action btn-check flex flex-col items-center"
                        >
                            <Check className="w-6 h-6 mb-1" />
                            <span>CHECK</span>
                        </button>
                    ) : availableActions.canCall ? (
                        <button
                            onClick={() => handleAction('CALL')}
                            className="btn-action btn-call flex flex-col items-center"
                        >
                            <Check className="w-6 h-6 mb-1" />
                            <span>CALL {availableActions.callAmount}</span>
                        </button>
                    ) : null}

                    {/* BET / RAISE */}
                    {(availableActions.canBet || availableActions.canRaise) && (
                        <button
                            onClick={() => {
                                setShowNumpad(true);
                                setBetAmount(
                                    currentBet === 0
                                        ? availableActions.minBet.toString()
                                        : availableActions.minRaise.toString()
                                );
                            }}
                            className="btn-action btn-raise flex flex-col items-center"
                        >
                            <ArrowUp className="w-6 h-6 mb-1" />
                            <span>{currentBet === 0 ? 'BET' : 'RAISE'}</span>
                        </button>
                    )}

                    {/* ALL IN */}
                    {currentPlayer.stack > 0 && (
                        <button
                            onClick={() => handleAction('ALL_IN')}
                            className="btn-action bg-purple-600 hover:bg-purple-500 text-white flex flex-col items-center col-span-3"
                        >
                            <span className="font-bold">ALL IN ({currentPlayer.stack})</span>
                        </button>
                    )}
                </div>
            ) : (
                /* テンキー入力 */
                <div className="space-y-4">
                    {/* 金額表示 */}
                    <div className="bg-gray-800 rounded-xl p-4 text-center">
                        <p className="text-sm text-gray-400 mb-1">
                            {currentBet === 0 ? 'ベット額' : 'レイズ額'}
                            (最小: {currentBet === 0 ? availableActions.minBet : availableActions.minRaise})
                        </p>
                        <p className="text-3xl font-bold text-yellow-400">
                            {betAmount || '0'}
                        </p>
                    </div>

                    {/* テンキー */}
                    <div className="grid grid-cols-3 gap-2">
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'].map((key) => (
                            <button
                                key={key}
                                onClick={() => handleNumpadInput(key)}
                                className={`numpad-btn ${key === 'clear' ? 'text-red-400 text-sm' :
                                        key === 'back' ? 'text-yellow-400' : ''
                                    }`}
                            >
                                {key === 'back' ? <Minus className="w-6 h-6 mx-auto" /> :
                                    key === 'clear' ? 'CLR' : key}
                            </button>
                        ))}
                    </div>

                    {/* 確定・キャンセル */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => {
                                setShowNumpad(false);
                                setBetAmount('');
                            }}
                            className="btn-action bg-gray-600 hover:bg-gray-500 text-white"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleBetConfirm}
                            className="btn-action bg-green-600 hover:bg-green-500 text-white"
                        >
                            確定
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
