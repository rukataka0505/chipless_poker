'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Settings } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { DealerNavigation, TableView, ActionPanel, ShowdownPanel, ConfirmationModal, PhaseTransitionModal, SettingsModal } from '@/components';

export default function GamePage() {
    const router = useRouter();
    const { phase, players, _hasHydrated } = useGameStore();
    const [isHomeConfirmOpen, setIsHomeConfirmOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // ハイドレーション完了まで待機
    if (!_hasHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-gray-400">読み込み中...</div>
            </div>
        );
    }

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
            {/* ヘッダー：ホームボタンと設定ボタン */}
            <div className="flex justify-between items-center mb-2">
                <button
                    onClick={() => setIsHomeConfirmOpen(true)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title="セットアップに戻る"
                >
                    <Home className="w-5 h-5 text-white" />
                </button>

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title="ゲーム設定"
                >
                    <Settings className="w-5 h-5 text-white" />
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

            {/* 確認モーダル（ホームに戻る） */}
            <ConfirmationModal
                isOpen={isHomeConfirmOpen}
                title="ホームに戻りますか？"
                message="進行中のゲームデータは保存されません。ホーム画面に戻ってよろしいですか？"
                confirmText="戻る"
                cancelText="キャンセル"
                onConfirm={() => {
                    setIsHomeConfirmOpen(false);
                    router.push('/');
                }}
                onCancel={() => setIsHomeConfirmOpen(false)}
            />

            {/* Phase Transition Modal */}
            <PhaseTransitionModal />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div >
    );
}
