import React, { useState, useEffect } from 'react';
import { Player } from '@/lib/poker/types';
import { X, Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, stack: number) => void;
    player?: Player | null; // If null, we are adding a new player
    isAdding?: boolean;
}

export function EditPlayerModal({ isOpen, onClose, onSave, player, isAdding = false }: EditPlayerModalProps) {
    const [name, setName] = useState('');
    const [stack, setStack] = useState(200);

    // Initial state when opening
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

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name, stack);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-gray-900 border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-xl z-10"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-white mb-6">
                            {isAdding ? 'プレイヤー追加' : 'プレイヤー編集'}
                        </h2>

                        <div className="space-y-6">
                            {/* Name Input */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                                    プレイヤー名
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="名前を入力"
                                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500 transition-colors"
                                    readOnly={!isAdding && !!player} // Name is readonly when editing existing player, unless we want to allow renaming? Let's allow renaming for now if desired, but user request focused on chips. Let's keep it editable.
                                />
                            </div>

                            {/* Stack Input */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                                    所持チップ
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleAmountChange(-10)}
                                        className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/50 text-red-500 flex items-center justify-center hover:bg-red-500/30 active:scale-95 transition-all"
                                    >
                                        <Minus size={20} />
                                    </button>

                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={stack}
                                            onChange={(e) => setStack(parseInt(e.target.value) || 0)}
                                            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-center text-xl font-bold text-yellow-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                        />
                                    </div>

                                    <button
                                        onClick={() => handleAmountChange(10)}
                                        className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/50 text-green-500 flex items-center justify-center hover:bg-green-500/30 active:scale-95 transition-all"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="flex justify-center gap-2 mt-3">
                                    {[50, 100, 500].map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => handleAmountChange(amount)}
                                            className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                                        >
                                            +{amount}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                disabled={!name.trim()}
                                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold py-3 rounded-lg shadow-lg hover:from-yellow-500 hover:to-yellow-400 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                {isAdding ? 'プレイヤーを追加' : '変更を保存'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
