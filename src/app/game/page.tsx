'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { DealerNavigation, TableView, ActionPanel, ShowdownPanel } from '@/components';

export default function GamePage() {
    const router = useRouter();
    const { phase, players } = useGameStore();

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
            {/* ヘッダー：ホームボタン */}
            <div className="flex justify-between items-center mb-2">
                <button
                    onClick={() => router.push('/')}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    title="セットアップに戻る"
                >
                    <Home className="w-5 h-5 text-white" />
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
        </div>
    );
}
