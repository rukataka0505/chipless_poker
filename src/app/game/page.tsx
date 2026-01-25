'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Bell, BellOff } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { DealerNavigation, TableView, ActionPanel, ShowdownPanel, ConfirmationModal } from '@/components';

export default function GamePage() {
    const router = useRouter();
    const { phase, players, showPhaseNotifications, togglePhaseNotifications } = useGameStore();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const handleGuideToggle = () => {
        if (showPhaseNotifications) {
            // ON -> OFFにする場合は確認
            setIsConfirmModalOpen(true);
        } else {
            // OFF -> ONにする場合は即時実行
            togglePhaseNotifications();
        }
    };

    const confirmToggleOff = () => {
        togglePhaseNotifications();
        setIsConfirmModalOpen(false);
    };

    // プレイヤーがいない場合はセットアップへリダイレクト
    if (players.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <p className="text-gray-400 mb-4">ゲームが開始されていません</p>
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl text-white"
                >
                    <Home className="w-5 h-5" />
                    セットアップに戻る
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col p-4 max-w-2xl mx-auto">
            {/* ヘッダー：ホームボタンとガイド設定 */}
            <div className="flex justify-between items-center mb-2">
                <button
                    onClick={() => router.push('/')}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title="セットアップに戻る"
                >
                    <Home className="w-5 h-5 text-white" />
                </button>

                <button
                    onClick={handleGuideToggle}
                    className={`
                        p-2 rounded-lg transition-colors flex items-center gap-2
                        ${showPhaseNotifications
                            ? 'bg-white/10 hover:bg-white/20 text-white'
                            : 'bg-white/5 hover:bg-white/10 text-gray-500'
                        }
                    `}
                    title={showPhaseNotifications ? 'ガイド表示: ON' : 'ガイド表示: OFF'}
                >
                    <span className="text-xs font-medium hidden sm:block">
                        {showPhaseNotifications ? 'ガイドON' : 'ガイドOFF'}
                    </span>
                    {showPhaseNotifications ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </button>
            </div>

            {/* ディーラーナビゲーション */}
            <DealerNavigation />

            {/* テーブルビュー */}
            <TableView />

            {/* アクションパネル（ベッティング中のみ） */}
            <ActionPanel />

            {/* ショーダウンパネル */}
            <ShowdownPanel />

            {/* 確認モーダル */}
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                title="ガイドの非表示"
                message="フェーズ遷移時のガイド（ポップアップ）を非表示にしますか？"
                confirmText="非表示にする"
                cancelText="キャンセル"
                onConfirm={confirmToggleOff}
                onCancel={() => setIsConfirmModalOpen(false)}
            />
        </div>
    );
}
