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
    HandHistory,
    GAME_CONSTANTS,
    COMMUNITY_CARDS_COUNT,
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
    isTransitioning: boolean;

    // Undo functionality
    undoStack: GameState[];          // 現在ハンド内のUndo用スタック
    handHistories: HandHistory[];    // 過去ハンドの履歴（最大10件、将来用）
    undo: () => boolean;             // 1つ前の状態に戻る（現在ハンド内のみ）
    canUndo: () => boolean;          // Undo可能かどうか

    // Settings
    showPhaseNotifications: boolean;
    togglePhaseNotifications: () => void;
    // Modifying Players
    updatePlayerStack: (playerId: string, newStack: number) => void;
    addPlayer: (name: string, stack: number) => void;
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
    isTransitioning: false,
    pendingPhase: null,
    showPhaseNotifications: true,
    isShowdownResolved: false,
    undoStack: [],
    handHistories: [],
    lastTotalPot: 0,
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

        let newHandHistories = state.handHistories;
        if (state.actionHistory.length > 0) {
            const currentHandHistory: HandHistory = {
                handNumber: state.handNumber,
                actions: [...state.actionHistory],
                finalState: {
                    phase: state.phase,
                    players: state.players.map(p => ({ ...p })),
                    dealerIndex: state.dealerIndex,
                    currentPlayerIndex: state.currentPlayerIndex,
                    pots: state.pots.map(p => ({ ...p, eligiblePlayerIds: [...p.eligiblePlayerIds] })),
                    currentBet: state.currentBet,
                    minRaise: state.minRaise,
                    lastRaiseAmount: state.lastRaiseAmount,
                    communityCardCount: state.communityCardCount,
                    handNumber: state.handNumber,
                    actionHistory: [...state.actionHistory],
                    showPhaseNotifications: state.showPhaseNotifications,
                    isShowdownResolved: state.isShowdownResolved,
                    lastTotalPot: state.lastTotalPot || 0,
                },
            };
            newHandHistories = [...state.handHistories, currentHandHistory];
        }

        const newState = startHand(state);
        set({
            ...newState,
            // プリフロップ通知の設定
            pendingPhase: state.showPhaseNotifications ? 'PREFLOP' : null,
            selectedWinners: new Map(),
            undoStack: [],  // 新ハンド開始時にUndoスタックをクリア
            handHistories: newHandHistories,
            lastTotalPot: 0, // Reset lastTotalPot
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

        // Undo用に変更前のGameStateを保存
        const snapshotState: GameState = {
            phase: state.phase,
            players: state.players.map(p => ({ ...p })),
            dealerIndex: state.dealerIndex,
            currentPlayerIndex: state.currentPlayerIndex,
            pots: state.pots.map(p => ({ ...p, eligiblePlayerIds: [...p.eligiblePlayerIds] })),
            currentBet: state.currentBet,
            minRaise: state.minRaise,
            lastRaiseAmount: state.lastRaiseAmount,
            communityCardCount: state.communityCardCount,
            handNumber: state.handNumber,
            actionHistory: [...state.actionHistory],
            showPhaseNotifications: state.showPhaseNotifications,
            isShowdownResolved: state.isShowdownResolved,
            lastTotalPot: state.lastTotalPot || 0,
        };

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
            // Apply the action visual immediately, but delay the phase transition
            const intermediateState: Partial<GameState> & { isTransitioning: boolean } = {
                ...newState,
                players: newPlayers,
                currentBet: newCurrentBet,
                minRaise: newMinRaise,
                isTransitioning: true, // Lock input
            };

            set({
                ...state,
                ...intermediateState,
                undoStack: [...state.undoStack, snapshotState],
            } as GameStore);

            // 1秒遅延してからフェーズ遷移
            setTimeout(() => {
                const currentState = get();
                // Ensure we haven't undid the action (isTransitioning check)
                if (!currentState.isTransitioning) return;

                // 次のフェーズを計算
                const advancedState = advancePhase(currentState);

                // FLOP, TURN, RIVERへの遷移はモーダルで確認（設定ONの場合のみ）
                const nextPhase = advancedState.phase;
                const shouldShowNotification = currentState.showPhaseNotifications &&
                    (nextPhase === 'FLOP' || nextPhase === 'TURN' || nextPhase === 'RIVER');

                let finalState: Partial<GameStore> = {};

                if (shouldShowNotification) {
                    // ポットに集約だけ行い、フェーズは保留（phaseは現在のまま維持）
                    finalState = {
                        pots: advancedState.pots,
                        players: advancedState.players,
                        currentBet: advancedState.currentBet,
                        minRaise: advancedState.minRaise,
                        lastRaiseAmount: advancedState.lastRaiseAmount,
                        // phase は更新しない（pendingPhase で保留）
                        pendingPhase: nextPhase,
                        isTransitioning: false,
                    } as Partial<GameStore>;
                } else {
                    // SHOWDOWN等はそのまま進行、または通知設定OFFなら即時遷移
                    finalState = {
                        ...advancedState,
                        isTransitioning: false,
                    };
                }

                set(state => ({
                    ...state,
                    ...finalState
                }));
            }, 600);

            return { success: true };

        } else {
            // 次のプレイヤーへ
            const movedState = moveToNextPlayer({
                ...state,
                ...newState,
            });
            newState.currentPlayerIndex = movedState.currentPlayerIndex;

            set({
                ...newState,
                undoStack: [...state.undoStack, snapshotState],
            } as GameState);
            return { success: true };
        }
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

        // Undo用に変更前のGameStateを保存
        const snapshotState: GameState = {
            phase: state.phase,
            players: state.players.map(p => ({ ...p })),
            dealerIndex: state.dealerIndex,
            currentPlayerIndex: state.currentPlayerIndex,
            pots: state.pots.map(p => ({ ...p, eligiblePlayerIds: [...p.eligiblePlayerIds] })),
            currentBet: state.currentBet,
            minRaise: state.minRaise,
            lastRaiseAmount: state.lastRaiseAmount,
            communityCardCount: state.communityCardCount,
            handNumber: state.handNumber,
            actionHistory: [...state.actionHistory],
            showPhaseNotifications: state.showPhaseNotifications,
            isShowdownResolved: state.isShowdownResolved,
            lastTotalPot: state.lastTotalPot || 0,
        };

        // 勝者にチップを配分
        const totalPot = pots.reduce((sum, pot) => sum + pot.amount, 0);
        const distribution = distributePots(pots, selectedWinners);

        const newPlayers = players.map(p => {
            const winnings = distribution.get(p.id) || 0;
            return {
                ...p,
                stack: p.stack + winnings,
            };
        });

        // 状態更新（フェーズはSHOWDOWNのまま、解決済みにする）
        set({
            players: newPlayers,
            pots: state.pots.map(p => ({ ...p, amount: 0 })), // ポットを空にする表示用
            isShowdownResolved: true,
            undoStack: [...state.undoStack, snapshotState],
            lastTotalPot: totalPot,
        });
    },

    proceedToNextHand: () => {
        const state = get();
        const { selectedWinners } = state;

        // 現在のハンド履歴を保存
        let newHandHistories = state.handHistories;
        if (state.actionHistory.length > 0) {
            const currentHandHistory: HandHistory = {
                handNumber: state.handNumber,
                actions: [...state.actionHistory],
                finalState: {
                    phase: state.phase,
                    players: state.players.map(p => ({ ...p })),
                    dealerIndex: state.dealerIndex,
                    currentPlayerIndex: state.currentPlayerIndex,
                    pots: state.pots.map(p => ({ ...p, eligiblePlayerIds: [...p.eligiblePlayerIds] })),
                    currentBet: state.currentBet,
                    minRaise: state.minRaise,
                    lastRaiseAmount: state.lastRaiseAmount,
                    communityCardCount: state.communityCardCount,
                    handNumber: state.handNumber,
                    actionHistory: [...state.actionHistory],
                    showPhaseNotifications: state.showPhaseNotifications,
                    isShowdownResolved: state.isShowdownResolved,
                    lastTotalPot: state.lastTotalPot || 0,
                },
            };
            newHandHistories = [...state.handHistories, currentHandHistory];

        }

        // 【重要】次のハンドに進む前に、プレイ継続可能なプレイヤー数をチェック
        // スタック > 0 のプレイヤーが2人未満の場合はゲーム終了
        const playersWithStack = state.players.filter(p => p.stack > 0);
        if (playersWithStack.length < 2) {
            // ゲーム終了 - プレイヤー不足
            set({
                phase: 'SETUP',
                selectedWinners: new Map(),
                undoStack: [],
                handHistories: newHandHistories,
                isShowdownResolved: false,
            });
            return;
        }

        // 次のハンドの準備（ディーラー移動など）
        const nextHandState = nextHand(state, Array.from(selectedWinners.keys()).map(String));

        if (nextHandState.phase === 'SETUP') {
            // ゲーム終了（プレイヤー不足など）
            set({ ...nextHandState, selectedWinners: new Map(), undoStack: [], handHistories: newHandHistories });
            return;
        }

        // 新しいハンドを開始
        const startedState = startHand(nextHandState);
        set({
            ...startedState,
            // プリフロップ通知の設定
            pendingPhase: state.showPhaseNotifications ? 'PREFLOP' : null,
            selectedWinners: new Map(),
            undoStack: [],  // 新ハンド開始時にUndoスタックをクリア
            handHistories: newHandHistories,
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
        if (state.phase === 'SETUP' || state.phase === 'SHOWDOWN' || state.isTransitioning) return false;

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

        if (state.phase === pendingPhase) {
            // Just clear, no advance needed (e.g. Preflop notification)
            set({ pendingPhase: null });
        } else {
            // フェーズを更新し、コミュニティカード数も設定
            // 注意: ポット集約やプレイヤーリセットは doAction の setTimeout 内で既に完了している
            // ここでは advancePhase を再度呼ばずに、フェーズとカード数のみを更新

            // 次のアクティブプレイヤーを探す（ディーラーの次から）
            let startIndex = (state.dealerIndex + 1) % state.players.length;
            let searchAttempts = 0;
            while (searchAttempts < state.players.length) {
                const player = state.players[startIndex];
                if (!player.folded && !player.allIn) {
                    break;
                }
                startIndex = (startIndex + 1) % state.players.length;
                searchAttempts++;
            }

            set({
                phase: pendingPhase,
                communityCardCount: COMMUNITY_CARDS_COUNT[pendingPhase],
                currentPlayerIndex: startIndex,
                pendingPhase: null,
            });
        }
    },

    togglePhaseNotifications: () => {
        set(state => ({ showPhaseNotifications: !state.showPhaseNotifications }));
    },

    // Modifying Players
    updatePlayerStack: (playerId: string, newStack: number) => {
        set(state => ({
            players: state.players.map(p =>
                p.id === playerId ? { ...p, stack: newStack } : p
            ),
        }));
    },

    addPlayer: (name: string, stack: number) => {
        set(state => {
            const newPlayerId = `player-${Date.now()}`;
            const newPlayer: Player = {
                id: newPlayerId,
                name: name,
                stack: stack,
                currentBet: 0,
                totalBetThisRound: 0,
                folded: state.phase !== 'SETUP', // Mid-game joiners are folded
                allIn: false,
                hasActedThisRound: false,
                position: null,
                seatIndex: state.players.length,
            };
            return {
                players: [...state.players, newPlayer],
            };
        });
    },

    // Undo functionality
    canUndo: () => {
        const state = get();
        return state.undoStack.length > 0;
    },

    undo: () => {
        const state = get();
        if (state.undoStack.length === 0) {
            return false;
        }

        // スタックから最後の状態を取り出す
        const newUndoStack = [...state.undoStack];
        const previousState = newUndoStack.pop()!;

        // 状態を復元
        // Showdownフェーズに戻る場合（解決済みからのUndoなど）は勝者選択を保持
        // それ以外（Riverに戻るなど）は勝者選択をリセット
        const shouldKeepSelectedWinners = previousState.phase === 'SHOWDOWN';

        set({
            ...previousState,
            undoStack: newUndoStack,
            handHistories: state.handHistories,  // 履歴は維持
            selectedWinners: shouldKeepSelectedWinners ? state.selectedWinners : new Map(),
            pendingPhase: null,  // 保留中のフェーズはクリア
        } as GameStore);

        return true;
    },
}));
