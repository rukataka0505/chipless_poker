/**
 * Zustand Store - ポーカーゲームのグローバル状態管理
 */

import { create } from 'zustand';
import {
    GameState,
    GamePhase,
    Player,
    PlayerAction,
    ActionRecord,
    GAME_CONSTANTS,
} from '@/lib/poker/types';
import {
    createInitialState,
    startHand,
    advancePhase,
    nextHand,
    moveToNextPlayer,
} from '@/lib/poker/gameStateMachine';
import {
    validateAction,
    processAction,
    getAvailableActions,
    isBettingRoundComplete,
    AvailableActions,
} from '@/lib/poker/bettingEngine';
import { calculateTotalPot, distributePots } from '@/lib/poker/potCalculator';

interface GameStore extends GameState {
    // Setup actions
    initializeGame: (playerNames: string[]) => void;
    startNewHand: () => void;

    // Player actions
    doAction: (action: PlayerAction, amount?: number) => { success: boolean; error?: string };

    // Showdown
    // Showdown
    selectWinners: (potIndex: number, winnerIds: string[]) => void;
    resolveShowdown: () => void;
    proceedToNextHand: () => void;

    // Phase transition modal
    pendingPhase: GamePhase | null;
    confirmPhaseTransition: () => void;

    // Getters
    getCurrentPlayer: () => Player | null;
    getAvailableActionsForCurrentPlayer: () => AvailableActions | null;
    getTotalPot: () => number;
    getActivePlayers: () => Player[];

    // State helpers
    isCurrentPlayerTurn: (playerId: string) => boolean;
    canPlayerAct: (playerId: string) => boolean;

    // Internal state
    selectedWinners: Map<number, string[]>;

    // Settings
    showPhaseNotifications: boolean;
    togglePhaseNotifications: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
    // Initial state
    phase: 'SETUP' as GamePhase,
    players: [],
    dealerIndex: 0,
    currentPlayerIndex: -1,
    pots: [],
    currentBet: 0,
    minRaise: GAME_CONSTANTS.BIG_BLIND,
    lastRaiseAmount: GAME_CONSTANTS.BIG_BLIND,
    communityCardCount: 0,
    handNumber: 0,
    actionHistory: [],
    selectedWinners: new Map(),
    pendingPhase: null,
    showPhaseNotifications: true,

    // Setup actions
    initializeGame: (playerNames: string[]) => {
        const initialState = createInitialState(playerNames);
        set({
            ...initialState,
            selectedWinners: new Map(),
        });
    },

    startNewHand: () => {
        const state = get();
        const newState = startHand(state);
        set({
            ...newState,
            // プリフロップ通知の設定
            pendingPhase: state.showPhaseNotifications ? 'PREFLOP' : null,
            selectedWinners: new Map(),
        });
    },

    // Player actions
    doAction: (action: PlayerAction, amount?: number) => {
        const state = get();
        const currentPlayer = state.players[state.currentPlayerIndex];

        if (!currentPlayer) {
            return { success: false, error: '現在のプレイヤーが見つかりません。' };
        }

        // バリデーション
        const validation = validateAction(
            action,
            amount,
            currentPlayer,
            state.currentBet,
            state.minRaise
        );

        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // アクション処理
        const { updatedPlayer, betAmount, newCurrentBet } = processAction(
            currentPlayer,
            action,
            amount,
            state.currentBet
        );

        // このラウンドでアクションしたことを記録
        updatedPlayer.hasActedThisRound = true;

        // プレイヤー配列を更新
        let newPlayers = [...state.players];
        newPlayers[state.currentPlayerIndex] = updatedPlayer;

        // レイズ/ベット/オールインで currentBet が上がった場合、他のプレイヤーは再度アクションが必要
        const isRaiseAction = action === 'RAISE' || action === 'BET' ||
            (action === 'ALL_IN' && updatedPlayer.currentBet > state.currentBet);
        if (isRaiseAction) {
            newPlayers = newPlayers.map((p, i) =>
                i === state.currentPlayerIndex
                    ? p
                    : { ...p, hasActedThisRound: false }
            );
        }

        // アクション履歴に追加
        const newActionHistory: ActionRecord[] = [
            ...state.actionHistory,
            {
                playerId: currentPlayer.id,
                action,
                amount: betAmount > 0 ? betAmount : undefined,
                timestamp: Date.now(),
            },
        ];

        // 最小レイズ額を更新
        let newMinRaise = state.minRaise;
        if (action === 'RAISE' || action === 'BET') {
            const raiseAmount = (amount || 0) - state.currentBet;
            if (raiseAmount > state.lastRaiseAmount) {
                newMinRaise = raiseAmount;
            }
        }

        // 新しい状態
        let newState: Partial<GameState> = {
            players: newPlayers,
            currentBet: newCurrentBet,
            minRaise: newMinRaise,
            lastRaiseAmount: action === 'RAISE' || action === 'BET'
                ? (amount || 0) - state.currentBet
                : state.lastRaiseAmount,
            actionHistory: newActionHistory,
        };

        // ベッティングラウンド終了チェック
        if (isBettingRoundComplete(newPlayers, newCurrentBet)) {
            // 次のフェーズを計算
            const advancedState = advancePhase({
                ...state,
                ...newState,
            });

            // FLOP, TURN, RIVERへの遷移はモーダルで確認（設定ONの場合のみ）
            const nextPhase = advancedState.phase;
            const shouldShowNotification = state.showPhaseNotifications &&
                (nextPhase === 'FLOP' || nextPhase === 'TURN' || nextPhase === 'RIVER');

            if (shouldShowNotification) {
                // ポットに集約だけ行い、フェーズは保留
                newState = {
                    ...newState,
                    pots: advancedState.pots,
                    pendingPhase: nextPhase,
                } as Partial<GameStore>;
            } else {
                // SHOWDOWN等はそのまま進行、または通知設定OFFなら即時遷移
                newState = advancedState;
            }
        } else {
            // 次のプレイヤーへ
            const movedState = moveToNextPlayer({
                ...state,
                ...newState,
            });
            newState.currentPlayerIndex = movedState.currentPlayerIndex;
        }

        set(newState as GameState);
        return { success: true };
    },

    // Showdown
    selectWinners: (potIndex: number, winnerIds: string[]) => {
        const selectedWinners = new Map(get().selectedWinners);
        selectedWinners.set(potIndex, winnerIds);
        set({ selectedWinners });
    },

    resolveShowdown: () => {
        const state = get();
        const { pots, players, selectedWinners } = state;

        // 勝者にチップを配分
        const distribution = distributePots(pots, selectedWinners);

        const newPlayers = players.map(p => {
            const winnings = distribution.get(p.id) || 0;
            return {
                ...p,
                stack: p.stack + winnings,
            };
        });

        // 状態更新（フェーズはSHOWDOWNのまま）
        set({
            players: newPlayers,
            pots: state.pots.map(p => ({ ...p, amount: 0 })), // ポットを空にする表示用
        });
    },

    proceedToNextHand: () => {
        const state = get();
        const { selectedWinners } = state;

        // 次のハンドの準備（ディーラー移動など）
        const nextHandState = nextHand(state, Array.from(selectedWinners.keys()).map(String)); // Map key is pot index, we don't need winners for nextHand currently

        if (nextHandState.phase === 'SETUP') {
            // ゲーム終了（プレイヤー不足など）
            set({ ...nextHandState, selectedWinners: new Map() });
            return;
        }

        // 新しいハンドを開始
        const startedState = startHand(nextHandState);
        set({
            ...startedState,
            // プリフロップ通知の設定
            pendingPhase: state.showPhaseNotifications ? 'PREFLOP' : null,
            selectedWinners: new Map(),
        });
    },

    // Getters
    getCurrentPlayer: () => {
        const state = get();
        if (state.currentPlayerIndex < 0 || state.currentPlayerIndex >= state.players.length) {
            return null;
        }
        return state.players[state.currentPlayerIndex];
    },

    getAvailableActionsForCurrentPlayer: () => {
        const state = get();
        const currentPlayer = state.players[state.currentPlayerIndex];
        if (!currentPlayer) return null;

        return getAvailableActions(currentPlayer, state.currentBet, state.minRaise);
    },

    getTotalPot: () => {
        const state = get();
        return calculateTotalPot(state.pots);
    },

    getActivePlayers: () => {
        return get().players.filter(p => !p.folded);
    },

    // State helpers
    isCurrentPlayerTurn: (playerId: string) => {
        const state = get();
        const currentPlayer = state.players[state.currentPlayerIndex];
        return currentPlayer?.id === playerId;
    },

    canPlayerAct: (playerId: string) => {
        const state = get();
        if (state.phase === 'SETUP' || state.phase === 'SHOWDOWN') return false;

        const currentPlayer = state.players[state.currentPlayerIndex];
        if (currentPlayer?.id !== playerId) return false;

        const player = state.players.find(p => p.id === playerId);
        if (!player || player.folded || player.allIn) return false;

        return true;
    },

    // Phase transition confirmation
    confirmPhaseTransition: () => {
        const state = get();
        const { pendingPhase } = state;

        if (!pendingPhase) return;

        // Actually advance to the pending phase
        // Actually advance to the pending phase
        if (state.phase === pendingPhase) {
            // Just clear, no advance needed (e.g. Preflop notification)
            set({ pendingPhase: null });
        } else {
            const advancedState = advancePhase(state);
            set({
                ...advancedState,
                phase: pendingPhase,
                pendingPhase: null,
            } as GameStore);
        }
    },

    togglePhaseNotifications: () => {
        set(state => ({ showPhaseNotifications: !state.showPhaseNotifications }));
    },
}));
