'use client';

import React, { useState } from 'react';
import { X, Check, ArrowUp, Minus, Plus, Undo2, ChevronUp } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { ConfirmationModal } from './ConfirmationModal';
import { PlayerAction } from '@/lib/poker/types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function ActionPanel() {
    const {
        phase,
        getCurrentPlayer,
        getAvailableActionsForCurrentPlayer,
        doAction,
        currentBet,
        getTotalPot,
        undo,
        canUndo,
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
    const minAmount = currentBet === 0 ? availableActions.minBet : availableActions.minRaise;

    let sliderMaxLimit = 0;
    if (currentBet === 0) {
        sliderMaxLimit = totalPot;
    } else {
        sliderMaxLimit = currentBet * 5;
    }

    const maxAmount = Math.min(sliderMaxLimit, playerTotalChips);
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
        if (value === '') {
            setBetAmount('');
            setError(null);
            return;
        }
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
        if (amount > playerTotalChips) {
            setError('所持金を超えています');
            return;
        }
        if (amount === playerTotalChips) {
            handleAction('ALL_IN');
            return;
        }
        if (amount < minAmount) {
            setError(`最小額は ${minAmount} です`);
            return;
        }
        const action: PlayerAction = currentBet === 0 ? 'BET' : 'RAISE';
        handleAction(action, amount);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex justify-center pointer-events-none">
            <Card variant="default" className="w-full max-w-2xl pointer-events-auto backdrop-blur-2xl bg-black/80 border-t border-white/10 shadow-2xl">
                <div className="p-2 sm:p-4 space-y-2 sm:space-y-4">
                    {/* Header: Player Info and Undo */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-electric/10 border border-electric/30 flex items-center justify-center">
                                <span className="text-electric font-bold text-lg">{currentPlayer.name.charAt(0)}</span>
                            </div>
                            <div>
                                <div className="text-xs text-text-secondary uppercase tracking-wider">現在の手番</div>
                                <div className="font-bold text-white">{currentPlayer.name}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-xs text-text-secondary uppercase tracking-wider">スタック</div>
                                <div className="font-display font-bold text-gold glow-text-gold">{currentPlayer.stack.toLocaleString()}</div>
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            <button
                                onClick={() => undo()}
                                disabled={!canUndo()}
                                className={`text-xs flex items-center gap-1 transition-colors ${canUndo() ? 'text-gray-400 hover:text-white' : 'text-gray-700 cursor-not-allowed'}`}
                                title="元に戻す"
                            >
                                <Undo2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-center text-red-400 text-sm bg-red-900/20 py-2 rounded-lg border border-red-500/20 animate-pulse">
                            {error}
                        </div>
                    )}

                    {/* Main Actions */}
                    {!showInput ? (
                        <div className="grid grid-cols-3 gap-3">
                            <Button
                                variant="danger"
                                onClick={() => handleAction('FOLD')}
                                className="h-14 sm:h-16"
                                icon={<X className="w-5 h-5" />}
                            >
                                Fold
                            </Button>

                            {availableActions.canCheck ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => handleAction('CHECK')}
                                    className="h-14 sm:h-16"
                                    icon={<Check className="w-5 h-5" />}
                                >
                                    Check
                                </Button>
                            ) : availableActions.canCall ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => handleAction('CALL')}
                                    className="h-14 sm:h-16"
                                    icon={<Check className="w-5 h-5" />}
                                >
                                    Call {availableActions.callAmount}
                                </Button>
                            ) : <div />}

                            {(availableActions.canBet || availableActions.canRaise) && (
                                <Button
                                    variant="electric"
                                    onClick={() => {
                                        setShowInput(true);
                                        setBetAmount(minAmount.toString());
                                    }}
                                    className="h-14 sm:h-16"
                                    icon={<ArrowUp className="w-5 h-5" />}
                                >
                                    {currentBet === 0 ? 'Bet' : 'Raise'}
                                </Button>
                            )}
                            {/* Keep ALL IN accessible directly if stack > 0, maybe as a smaller option or replacing bet if stack is low? 
                                 For now, trusting implemented logic, keeping UI clean. 
                                 The original had a big ALL IN button below. Let's add it if stack is low or just as an option.
                             */}
                        </div>
                    ) : (
                        /* Bet/Raise Input UI */
                        <div className="space-y-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-secondary uppercase tracking-wider">{currentBet === 0 ? 'ベット額' : 'レイズ額'}</span>
                                <button onClick={handleAllInClick} className="text-xs font-bold text-gold hover:text-white transition-colors">ALL IN</button>
                            </div>

                            <div className="relative">
                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl ${currentBet > 0 ? 'text-red-500' : 'text-gold'}`}>$</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={betAmount}
                                    onChange={handleInputChange}
                                    className={`w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-3xl font-display font-bold text-white focus:outline-none transition-colors text-center ${currentBet > 0 ? 'focus:border-red-500/50' : 'focus:border-gold/50'}`}
                                    placeholder={minAmount.toString()}
                                />
                            </div>

                            {/* Slider Controls */}
                            <div className="flex items-center gap-4">
                                <button onClick={handleDecrement} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                                    <Minus size={18} />
                                </button>
                                <div className="flex-1 relative h-2 bg-white/10 rounded-full overflow-hidden">
                                    <input
                                        type="range"
                                        min={minAmount}
                                        max={effectiveSliderMax}
                                        value={betAmount || minAmount}
                                        onChange={handleSliderChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div
                                        className={`h-full bg-gradient-to-r ${currentBet > 0 ? 'from-red-900 to-red-500' : 'from-electric to-gold'}`}
                                        style={{ width: `${Math.min(100, ((parseInt(betAmount) || minAmount) - minAmount) / (effectiveSliderMax - minAmount) * 100)}%` }}
                                    />
                                </div>
                                <button onClick={handleIncrement} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors">
                                    <Plus size={18} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button variant="ghost" onClick={() => { setShowInput(false); setBetAmount(''); setError(null); }}>
                                    キャンセル
                                </Button>
                                <Button variant={currentBet > 0 ? 'ruby' : 'gold'} onClick={handleBetConfirm}>
                                    {currentBet === 0 ? 'Bet' : 'Raise'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <ConfirmationModal
                isOpen={showFoldConfirmation}
                title="Fold確認"
                message="無料でチェックできます。本当にフォールドしますか？"
                confirmText="Fold"
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
