import React, { useState, useEffect } from 'react';
import { Player } from '@/lib/poker/types';
import { X, Plus, Minus, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface EditPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, stack: number) => void;
    player?: Player | null;
    isAdding?: boolean;
    onToggleSitOut?: (playerId: string) => void;
    onDeletePlayer?: (playerId: string) => void;
}

export function EditPlayerModal({
    isOpen,
    onClose,
    onSave,
    player,
    isAdding = false,
    onToggleSitOut,
    onDeletePlayer
}: EditPlayerModalProps) {
    const [name, setName] = useState('');
    const [stack, setStack] = useState(200);

    useEffect(() => {
        if (isOpen) {
            if (player) {
                setName(player.name);
                setStack(player.stack);
            } else {
                setName('');
                setStack(200);
            }
        }
    }, [isOpen, player]);

    const handleAmountChange = (amount: number) => {
        setStack(prev => Math.max(0, prev + amount));
    };

    const hasChanges = player ? (name !== player.name || stack !== player.stack) : false;

    const handleSave = () => {
        if (!name.trim()) return;

        if (isAdding) {
            onSave(name, stack);
            onClose();
            return;
        }

        if (!hasChanges) return;

        const changes = [];
        if (player && name !== player.name) changes.push(`プレイヤー名: ${player.name} -> ${name}`);
        if (player && stack !== player.stack) changes.push(`スタック: ${player.stack} -> ${stack}`);

        if (changes.length > 0) {
            const confirmMessage = `設定を変更しますか？\n\n${changes.join('\n')}`;
            if (window.confirm(confirmMessage)) {
                onSave(name, stack);
                onClose();
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) onClose();
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-sm"
                    >
                        <Card variant="default" className="w-full p-6 relative bg-black/90 border-white/10 shadow-2xl">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-display font-bold text-white mb-6 tracking-wide">
                                {isAdding ? 'プレイヤー追加' : 'プレイヤー編集'}
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-bold">
                                        プレイヤー名
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="名前を入力"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 transition-colors font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-bold">
                                        スタック
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => handleAmountChange(-10)}
                                            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                                        >
                                            <Minus size={20} />
                                        </button>

                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                value={stack}
                                                onChange={(e) => setStack(parseInt(e.target.value) || 0)}
                                                className="w-full bg-transparent border-b border-white/10 py-2 text-center text-3xl font-display font-bold text-gold focus:outline-none focus:border-gold transition-colors"
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleAmountChange(10)}
                                            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>
                                    <div className="flex justify-center gap-2 mt-4">
                                        {[50, 100, 500].map(amount => (
                                            <button
                                                key={amount}
                                                onClick={() => handleAmountChange(amount)}
                                                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-text-secondary hover:bg-white/10 hover:text-white transition-colors"
                                            >
                                                +{amount}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions for Existing Players */}
                                {!isAdding && player && (
                                    <div className="pt-2 space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Sit Out / In Toggle */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (player.isSittingOutNextHand) {
                                                        // Currently Sitting Out (Next Hand) -> Want to Sit In
                                                        if (window.confirm("次のハンドから復帰しますか？")) {
                                                            onToggleSitOut?.(player.id);
                                                            onClose();
                                                        }
                                                    } else {
                                                        // Currently Playing -> Want to Sit Out
                                                        if (window.confirm("次のハンドから離席しますがよろしいですか？チップは保持されます")) {
                                                            onToggleSitOut?.(player.id);
                                                            onClose();
                                                        }
                                                    }
                                                }}
                                                className={`
                                                    py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wide transition-all border
                                                    ${player.isSittingOutNextHand
                                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]'
                                                        : 'bg-indigo-500/20 border-indigo-500 text-indigo-300 hover:bg-indigo-500/30 hover:text-white'
                                                    }
                                                `}
                                            >
                                                {player.isSittingOutNextHand ? '離席中' : '一時離席'}
                                            </button>

                                            {/* Delete Toggle */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (player.isDeletedNextHand) {
                                                        // Cancel delete - instant
                                                        onDeletePlayer?.(player.id);
                                                        onClose();
                                                    } else {
                                                        // Delete - confirm
                                                        if (window.confirm("次のハンドからプレイヤーを削除します　収支データは削除されません")) {
                                                            onDeletePlayer?.(player.id);
                                                            onClose();
                                                        }
                                                    }
                                                }}
                                                className={`
                                                    py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wide transition-all border flex items-center justify-center gap-2
                                                    ${player.isDeletedNextHand
                                                        ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]'
                                                        : 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30 hover:text-white'
                                                    }
                                                `}
                                            >
                                                {!player.isDeletedNextHand && <Trash2 size={14} />}
                                                {player.isDeletedNextHand ? '削除キャンセル' : 'プレイヤーを削除'}
                                            </button>
                                        </div>

                                        {/* Status Message */}
                                        {(player.isSittingOutNextHand || player.isDeletedNextHand) && (
                                            <div className="text-center text-[10px] text-gold/80 animate-pulse">
                                                ※ 次のハンド開始時に適用されます
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Button
                                    variant="gold"
                                    onClick={handleSave}
                                    disabled={!name.trim() || (!isAdding && !hasChanges)}
                                    className="w-full mt-2"
                                    icon={<Check size={20} />}
                                >
                                    {isAdding ? 'プレイヤー追加' : '変更を保存'}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
