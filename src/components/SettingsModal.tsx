'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Bell, BellOff, Users, Coins, ArrowRightLeft, GripVertical, RotateCcw } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
        removedPlayers,
        showPhaseNotifications,
        togglePhaseNotifications,
        pendingSeatOrder,
        setSeatOrder,
        clearSeatOrder
    } = useGameStore();

    const [sbValue, setSbValue] = useState('');
    const [bbValue, setBbValue] = useState('');
    const [seatOrderItems, setSeatOrderItems] = useState<string[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (isOpen) {
            setSbValue(smallBlind.toString());
            setBbValue(bigBlind.toString());
            // Initialize seat order items based on pendingSeatOrder or current players
            if (pendingSeatOrder) {
                // Should verify all pending IDs still exist in players, or fallback
                // For simplicity, we trust pendingSeatOrder but ensuring length match could be good
                setSeatOrderItems(pendingSeatOrder);
            } else {
                setSeatOrderItems(players.map(p => p.id));
            }
        }
    }, [isOpen, smallBlind, bigBlind, pendingSeatOrder, players]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSeatOrderItems((items) => {
                const oldIndex = items.indexOf(active.id.toString());
                const newIndex = items.indexOf(over.id.toString());
                const newOrder = arrayMove(items, oldIndex, newIndex);
                // Only update local state, no store change until save
                return newOrder;
            });
        }
    };

    const handleResetSeatOrder = () => {
        const defaultOrder = players.map(p => p.id);
        setSeatOrderItems(defaultOrder);
        // clearSeatOrder will be handled in handleSave or on close
    };

    if (!isOpen) return null;

    // Change Detection
    const hasChanges = (() => {
        if (sbValue !== smallBlind.toString()) return true;
        if (bbValue !== bigBlind.toString()) return true;

        const currentServerOrder = pendingSeatOrder || players.map(p => p.id);
        if (seatOrderItems.length !== currentServerOrder.length) return true;

        for (let i = 0; i < seatOrderItems.length; i++) {
            if (seatOrderItems[i] !== currentServerOrder[i]) return true;
        }

        return false;
    })();

    const handleSave = () => {
        const sb = parseInt(sbValue, 10);
        const bb = parseInt(bbValue, 10);

        if (!isNaN(sb) && !isNaN(bb)) {
            // Prepare changes list for confirmation
            const changes = [];
            if (sb !== smallBlind) changes.push(`Small Blind: ${smallBlind} -> ${sb}`);
            if (bb !== bigBlind) changes.push(`Big Blind: ${bigBlind} -> ${bb}`);

            const currentServerOrder = pendingSeatOrder || players.map(p => p.id);
            const isOrderChanged = seatOrderItems.length !== currentServerOrder.length ||
                !seatOrderItems.every((id, i) => id === currentServerOrder[i]);

            if (isOrderChanged) {
                changes.push('座席順を変更');
            }

            if (changes.length > 0) {
                const confirmMessage = `設定を変更しますか？\n\n${changes.join('\n')}`;
                if (!window.confirm(confirmMessage)) {
                    return;
                }
            }

            updateBlinds(sb, bb);

            // Apply seat order: check if order changed from current players order (for store logic)
            const currentPlayersOrder = players.map(p => p.id);
            const orderDifferentFromPlayers = seatOrderItems.length === currentPlayersOrder.length &&
                !seatOrderItems.every((id, i) => id === currentPlayersOrder[i]);

            if (orderDifferentFromPlayers) {
                setSeatOrder(seatOrderItems);
            } else {
                // If order matches original, clear any pending order
                clearSeatOrder();
            }

            onClose();
        }
    };

    const getPlayerName = (playerId: string) => {
        const player = players.find(p => p.id === playerId);
        return player?.name || '???';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="absolute inset-0" onClick={onClose} />
            <Card variant="default" className="w-full max-w-lg mx-6 p-6 relative z-10 border-white/10 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                            <Settings className="w-5 h-5 text-gold" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-white whitespace-nowrap">ゲーム設定</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="gold"
                            onClick={handleSave}
                            disabled={!hasChanges}
                            className="py-0.5 px-1.5 text-sm flex-shrink-0"
                            icon={<Save className="w-4 h-4" />}
                        >
                            <span>保存</span>
                        </Button>
                        <button
                            onClick={onClose}
                            className="p-2 text-text-tertiary hover:text-white transition-colors flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
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
                                    {/* Active players */}
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
                                    {/* Removed players (balance history preserved) */}
                                    {removedPlayers.map(player => {
                                        const buyIn = player.buyIn ?? 0;
                                        const effectiveStack = player.stack + player.currentBet;
                                        const profit = effectiveStack - buyIn;
                                        const isPositive = profit > 0;
                                        const isNegative = profit < 0;

                                        return (
                                            <tr key={player.id} className="text-gray-400 hover:bg-white/5 transition-colors opacity-70">
                                                <td className="px-4 py-3 font-bold">
                                                    {player.name}
                                                    <span className="ml-2 text-xs text-gray-500">(削除済)</span>
                                                </td>
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

                    {/* Section 4: Seat Swap (Drag & Drop) */}
                    {players.length >= 2 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-text-secondary uppercase tracking-wider flex items-center gap-2">
                                    <ArrowRightLeft className="w-4 h-4" /> 席替え
                                </label>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-text-tertiary">
                                        次のハンドから適用
                                    </span>
                                    {pendingSeatOrder && (
                                        <button
                                            onClick={handleResetSeatOrder}
                                            className="text-xs text-gold flex items-center gap-1 hover:underline"
                                        >
                                            <RotateCcw className="w-3 h-3" /> リセット
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-black/20 rounded-xl border border-white/5 p-4 space-y-3">
                                <div className="text-xs text-text-tertiary mb-2">
                                    ドラッグして座席順（時計回り）を変更できます
                                </div>

                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={seatOrderItems}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-2">
                                            {seatOrderItems.map((id, index) => (
                                                <SortableItem key={id} id={id} name={getPlayerName(id)} index={index} />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DndContext>
                            </div>
                        </div>
                    )}


                </div>
            </Card>
        </div>
    );
}

function SortableItem({ id, name, index }: { id: string; name: string, index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg p-3 touch-none group hover:bg-white/10 transition-colors"
        >
            <div className="text-text-tertiary cursor-grab active:cursor-grabbing p-1 hover:text-white transition-colors">
                <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-1 font-medium text-white flex items-center justify-between">
                <span>{name}</span>
                <span className="text-xs text-text-tertiary bg-black/30 px-2 py-0.5 rounded-full">
                    席 {index + 1}
                </span>
            </div>
        </div>
    );
}
