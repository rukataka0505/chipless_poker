'use client';

import React, { useState } from 'react';
import { X, Check, ArrowUp, Minus, Plus } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { ConfirmationModal } from './ConfirmationModal';
import { PlayerAction } from '@/lib/poker/types';

export function ActionPanel() {
    const {
        phase,
        getCurrentPlayer,
        getAvailableActionsForCurrentPlayer,
        doAction,
        currentBet,
        getTotalPot,
    } = useGameStore();

    const [betAmount, setBetAmount] = useState<string>('');
    const [showInput, setShowInput] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showFoldConfirmation, setShowFoldConfirmation] = useState(false);

    const currentPlayer = getCurrentPlayer();
    const availableActions = getAvailableActionsForCurrentPlayer();

    if (!currentPlayer || !availableActions || phase === 'SETUP' || phase === 'SHOWDOWN') {
        return null;
    }

    const totalPot = getTotalPot();
    const playerTotalChips = currentPlayer.stack + currentPlayer.currentBet;

    // スライダーと入力の最小・最大値計算
    const minAmount = currentBet === 0 ? availableActions.minBet : availableActions.minRaise;

    // スライダーの最大値計算
    let sliderMaxLimit = 0;
    if (currentBet === 0) {
        // ベット時: ポットの100%
        sliderMaxLimit = totalPot;
    } else {
        // レイズ時: 相手のベット額(currentBet)の5倍
        sliderMaxLimit = currentBet * 5;
    }

    // プレイヤーの所持金(現在のベット含む)を超えないように制限
    const maxAmount = Math.min(sliderMaxLimit, playerTotalChips);

    // スライダーの最大値が最小値を下回る場合のガード（オールイン対応等）
    const effectiveSliderMax = Math.max(minAmount, maxAmount);

    const executeAction = (action: PlayerAction, amount?: number) => {
        setError(null);
        const result = doAction(action, amount);
        if (!result.success) {
            setError(result.error || 'エラーが発生しました');
        } else {
            setBetAmount('');
            setShowInput(false);
        }
    };

    const handleAction = (action: PlayerAction, amount?: number) => {
        if (action === 'FOLD' && availableActions.canCheck) {
            setShowFoldConfirmation(true);
            return;
        }
        executeAction(action, amount);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // 空文字は許可
        if (value === '') {
            setBetAmount('');
            setError(null);
            return;
        }

        // 半角数字チェック
        if (!/^[0-9]+$/.test(value)) {
            setError('半角数字以外は入力できません');
            return;
        }

        setError(null);
        setBetAmount(value);
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBetAmount(e.target.value);
        setError(null);
    };

    const handleAllInClick = () => {
        // オールインボタン: プレイヤーの全チップ額を入力
        setBetAmount(playerTotalChips.toString());
        setError(null);
    };

    const handleIncrement = () => {
        const currentVal = parseInt(betAmount, 10) || minAmount;
        if (currentVal < effectiveSliderMax) {
            setBetAmount((currentVal + 1).toString());
            setError(null);
        }
    };

    const handleDecrement = () => {
        const currentVal = parseInt(betAmount, 10) || minAmount;
        if (currentVal > minAmount) {
            setBetAmount((currentVal - 1).toString());
            setError(null);
        }
    };

    const handleBetConfirm = () => {
        const amount = parseInt(betAmount, 10);

        if (isNaN(amount)) {
            setError('金額を入力してください');
            return;
        }

        // 最大額チェック (所持金チェック)
        if (amount > playerTotalChips) {
            setError('所持金を超えています');
            return;
        }

        // オールイン判定 (全額ベットの場合) - 最小額チェックの前に判定
        if (amount === playerTotalChips) {
            handleAction('ALL_IN');
            return;
        }

        // 範囲チェック (オールインでない場合)
        if (amount < minAmount) {
            setError(`最小額は ${minAmount} です`);
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
                <p className="text-xs text-gray-500 mt-1">Total Pot: {totalPot}</p>
            </div>

            {/* エラー表示 */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 rounded-lg p-2 mb-4 text-center text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* アクションボタン */}
            {!showInput ? (
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
                                setShowInput(true);
                                setBetAmount(minAmount.toString());
                            }}
                            className="btn-action btn-raise flex flex-col items-center"
                        >
                            <ArrowUp className="w-6 h-6 mb-1" />
                            <span>{currentBet === 0 ? 'BET' : 'RAISE'}</span>
                        </button>
                    )}

                    {/* ALL IN (Direct Action) - Optional to keep, but requirements imply using the input UI mainly. 
                        Keeping this for quick access if user prefers skipping input UI for direct All-In 
                        (though "All-In button inside UI" was requested). 
                        Let's keep it as a main action too for convenience. */}
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
                /* 入力UI (キーボード + スライダー) */
                <div className="space-y-4">
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm text-gray-400">
                                {currentBet === 0 ? 'ベット額' : 'レイズ額'}
                            </label>
                            <button
                                onClick={handleAllInClick}
                                className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-2 py-1 rounded"
                            >
                                ALL IN
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-yellow-400 font-bold text-lg">$</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={betAmount}
                                onChange={handleInputChange}
                                className="w-full bg-transparent text-3xl font-bold text-white focus:outline-none"
                                placeholder={minAmount.toString()}
                            />
                        </div>

                        {/* スライダー */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDecrement}
                                disabled={(parseInt(betAmount, 10) || minAmount) <= minAmount}
                                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                            >
                                <Minus size={20} />
                            </button>

                            <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs text-gray-500 w-8 text-right">{minAmount}</span>
                                <input
                                    type="range"
                                    min={minAmount}
                                    max={effectiveSliderMax}
                                    value={betAmount || minAmount}
                                    onChange={handleSliderChange}
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                                />
                                <span className="text-xs text-gray-500 w-8">{effectiveSliderMax}</span>
                            </div>

                            <button
                                onClick={handleIncrement}
                                disabled={(parseInt(betAmount, 10) || minAmount) >= effectiveSliderMax}
                                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                    </div>

                    {/* 確定・キャンセル */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => {
                                setShowInput(false);
                                setBetAmount('');
                                setError(null);
                            }}
                            className="btn-action bg-gray-600 hover:bg-gray-500 text-white"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleBetConfirm}
                            className={`btn-action text-white ${error ? 'bg-green-600/50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'
                                }`}
                            disabled={!!error}
                        >
                            確定
                        </button>
                    </div>
                </div>
            )}


            <ConfirmationModal
                isOpen={showFoldConfirmation}
                title="確認"
                message="チェックが可能ですがフォールドしますか？"
                confirmText="フォールドする"
                cancelText="キャンセル"
                onConfirm={() => {
                    setShowFoldConfirmation(false);
                    executeAction('FOLD');
                }}
                onCancel={() => setShowFoldConfirmation(false)}
            />
        </div>
    );
}
