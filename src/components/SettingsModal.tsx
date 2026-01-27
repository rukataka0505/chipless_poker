'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Bell, BellOff, Users, Coins } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const {
        smallBlind,
        bigBlind,
        updateBlinds,
        players,
        showPhaseNotifications,
        togglePhaseNotifications
    } = useGameStore();

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
            <Card variant="default" className="w-full max-w-lg mx-6 p-6 relative z-10 border-white/10 max-h-[85vh] overflow-y-auto">
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

                <div className="space-y-8">
                    {/* Section 1: Guide Settings */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-text-secondary uppercase tracking-wider flex items-center gap-2">
                            <Bell className="w-4 h-4" /> ガイド設定
                        </label>
                        <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                            <div className="space-y-1">
                                <div className="text-white font-medium">フェーズ遷移ガイド</div>
                                <div className="text-xs text-text-tertiary">各フェーズ開始時に操作説明を表示します</div>
                            </div>
                            <button
                                onClick={togglePhaseNotifications}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all
                                    ${showPhaseNotifications
                                        ? 'bg-gold text-black shadow-lg shadow-gold/20'
                                        : 'bg-white/10 text-gray-400 hover:bg-white/20'
                                    }
                                `}
                            >
                                {showPhaseNotifications ? (
                                    <>
                                        <Bell className="w-4 h-4" /> ON
                                    </>
                                ) : (
                                    <>
                                        <BellOff className="w-4 h-4" /> OFF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Section 2: Blind Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-text-secondary uppercase tracking-wider flex items-center gap-2">
                                <Coins className="w-4 h-4" /> ブラインド設定
                            </label>
                            <span className="text-xs text-text-tertiary">
                                次のハンドから適用
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

                    {/* Section 3: Player Balance */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-text-secondary uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4" /> プレイヤー収支
                        </label>
                        <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-text-tertiary">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">名前</th>
                                        <th className="px-4 py-3 font-medium text-right">バイイン</th>
                                        <th className="px-4 py-3 font-medium text-right">スタック</th>
                                        <th className="px-4 py-3 font-medium text-right">収支</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {players.map(player => {
                                        const buyIn = player.buyIn ?? 0;
                                        // スタック + 現在のベット額 = 実質的な所持チップ
                                        const effectiveStack = player.stack + player.currentBet;
                                        const profit = effectiveStack - buyIn;
                                        const isPositive = profit > 0;
                                        const isNegative = profit < 0;

                                        return (
                                            <tr key={player.id} className="text-white hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-bold">{player.name}</td>
                                                <td className="px-4 py-3 text-right text-text-tertiary">{buyIn}</td>
                                                <td className="px-4 py-3 text-right">{effectiveStack}</td>
                                                <td className={`px-4 py-3 text-right font-bold ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'}`}>
                                                    {isPositive ? '+' : ''}{profit}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Button
                        variant="gold"
                        className="w-full"
                        onClick={handleSave}
                        icon={<Save className="w-4 h-4" />}
                    >
                        設定を保存して閉じる
                    </Button>
                </div>
            </Card>
        </div>
    );
}
