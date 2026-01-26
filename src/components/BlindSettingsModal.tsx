'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, X } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface BlindSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BlindSettingsModal({ isOpen, onClose }: BlindSettingsModalProps) {
    const { smallBlind, bigBlind, updateBlinds } = useGameStore();

    const [sbValue, setSbValue] = useState('');
    const [bbValue, setBbValue] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSbValue(smallBlind.toString());
            setBbValue(bigBlind.toString());
        }
    }, [isOpen, smallBlind, bigBlind]);

    if (!isOpen) return null;

    const handleSave = () => {
        const sb = parseInt(sbValue, 10);
        const bb = parseInt(bbValue, 10);

        if (!isNaN(sb) && !isNaN(bb)) {
            updateBlinds(sb, bb);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} />
            <Card variant="default" className="w-full max-w-md mx-6 p-6 relative z-10 border-white/10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-text-tertiary hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        <Settings className="w-5 h-5 text-gold" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-white">ゲーム設定</h2>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-text-secondary uppercase tracking-wider">
                                ブラインド設定
                            </label>
                            <span className="text-xs text-text-tertiary">
                                次のハンドから適用されます (一部即時)
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-text-tertiary">Small Blind</label>
                                <input
                                    type="text"
                                    value={sbValue}
                                    onChange={(e) => /^\d*$/.test(e.target.value) && setSbValue(e.target.value)}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-center font-display font-bold text-white focus:outline-none focus:bg-white/5 focus:border-gold/30 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-text-tertiary">Big Blind</label>
                                <input
                                    type="text"
                                    value={bbValue}
                                    onChange={(e) => /^\d*$/.test(e.target.value) && setBbValue(e.target.value)}
                                    className="w-full bg-black/20 border border-white/5 rounded-xl py-3 px-4 text-center font-display font-bold text-white focus:outline-none focus:bg-white/5 focus:border-gold/30 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="gold"
                        className="w-full"
                        onClick={handleSave}
                        icon={<Save className="w-4 h-4" />}
                    >
                        設定を保存
                    </Button>
                </div>
            </Card>
        </div>
    );
}
