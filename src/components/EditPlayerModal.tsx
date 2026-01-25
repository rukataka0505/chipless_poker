import React, { useState, useEffect } from 'react';
import { Player } from '@/lib/poker/types';
import { X, Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface EditPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, stack: number) => void;
    player?: Player | null;
    isAdding?: boolean;
}

export function EditPlayerModal({ isOpen, onClose, onSave, player, isAdding = false }: EditPlayerModalProps) {
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

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name, stack);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
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
                                {isAdding ? 'Add Player' : 'Edit Player'}
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-bold">
                                        Player Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter name"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gold/50 transition-colors font-medium"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-text-secondary mb-2 font-bold">
                                        Chips Stack
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

                                <Button
                                    variant="gold"
                                    onClick={handleSave}
                                    disabled={!name.trim()}
                                    className="w-full mt-2"
                                    icon={<Check size={20} />}
                                >
                                    {isAdding ? 'Add Player' : 'Save Changes'}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
