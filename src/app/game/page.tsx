'use client';

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Settings } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { DealerNavigation, TableView, ActionPanel, ShowdownPanel, ConfirmationModal, PhaseTransitionModal, SettingsModal } from '@/components';

export default function GamePage() {
    const router = useRouter();
    const { phase, players, _hasHydrated } = useGameStore();
    const [isHomeConfirmOpen, setIsHomeConfirmOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // 動的オフセット計算用のref
    const headerRef = useRef<HTMLDivElement>(null);
    const [offsets, setOffsets] = useState({ top: 130, bottom: 140 });
    const lastStableBottomOffset = useRef<number>(20); // 初期値は最小値(20)としておく

    // SSRとCSRの違いを吸収するためuseEffectを使用
    useEffect(() => {
        const updateOffsets = () => {
            // ヘッダーエリアの高さを取得
            const headerHeight = headerRef.current?.offsetHeight || 0;

            // ActionPanel/ShowdownPanelはfixed配置なので、直接DOMから取得
            // これらのコンポーネントは fixed bottom-0 で配置されている
            const actionPanelElement = document.querySelector('[data-panel="action"]');
            const showdownPanelElement = document.querySelector('[data-panel="showdown"]');

            // 入力モード（拡大中）かどうかをチェック
            const isActionExpanded = actionPanelElement?.getAttribute('data-expanded') === 'true';

            let bottomOffset = 20;

            if (isActionExpanded) {
                // 拡大中は、直前の安定した高さを使用（レイアウト崩れ防止）
                bottomOffset = lastStableBottomOffset.current;
            } else {
                // 両方のパネルの高さを取得し、表示されている方を使用
                const actionPanelHeight = actionPanelElement?.getBoundingClientRect().height || 0;
                const showdownPanelHeight = showdownPanelElement?.getBoundingClientRect().height || 0;
                const bottomPanelHeight = Math.max(actionPanelHeight, showdownPanelHeight);

                // 通常時は高さを計算して適用
                bottomOffset = bottomPanelHeight > 0 ? bottomPanelHeight + 2 : 20;

                // 安定状態の高さを保存
                lastStableBottomOffset.current = bottomOffset;
            }

            // パディング (p-4 = 16px) を考慮せず、直接配置
            // さらに攻めて余白を最小限(2px)に設定。デフォルトボトムオフセットも大幅削減。
            const topOffset = headerHeight + 2;

            setOffsets({
                top: topOffset > 0 ? topOffset : 130,
                bottom: bottomOffset
            });
        };

        // 初回とDOM更新後に実行
        updateOffsets();

        // リサイズイベントで再計算
        window.addEventListener('resize', updateOffsets);

        // MutationObserverでDOMの変更を監視（パネルの表示/非表示）
        const mutationObserver = new MutationObserver(updateOffsets);
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style']
        });

        // ResizeObserverでヘッダーのサイズ変更を監視
        const resizeObserver = new ResizeObserver(updateOffsets);
        if (headerRef.current) resizeObserver.observe(headerRef.current);

        return () => {
            window.removeEventListener('resize', updateOffsets);
            mutationObserver.disconnect();
            resizeObserver.disconnect();
        };
    }, [phase]); // phaseが変わると表示コンポーネントが変わるため

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
        <div className="h-screen flex flex-col p-4 overflow-hidden relative">
            {/* ヘッダーエリア（動的高さ計測用） */}
            <div ref={headerRef} className="max-w-2xl mx-auto w-full">
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
            </div>

            {/* テーブルビュー */}
            <TableView topOffset={offsets.top} bottomOffset={offsets.bottom} />

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
