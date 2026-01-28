/**
 * Game State Machine - ポーカーの状態遷移を管理
 */

import {
    GameState,
    GamePhase,
    Player,
    GAME_CONSTANTS,
    COMMUNITY_CARDS_COUNT,
} from './types';
import { calculateSidePots } from './potCalculator';
import { isBettingRoundComplete, getNextPlayerIndex } from './bettingEngine';

/**
 * 初期ゲーム状態を作成
 */
export function createInitialState(
    playerNames: string[],
    initialStack: number = GAME_CONSTANTS.INITIAL_STACK,
    smallBlind: number = GAME_CONSTANTS.SMALL_BLIND,
    bigBlind: number = GAME_CONSTANTS.BIG_BLIND
): GameState {
    const numPlayers = playerNames.length;

    // ディーラーをランダムに決定
    const dealerIndex = Math.floor(Math.random() * numPlayers);

    // プレイヤーを作成
    const players: Player[] = playerNames.map((name, index) => ({
        id: `player-${index}`,
        name,
        stack: initialStack,
        currentBet: 0,
        totalBetThisRound: 0,
        folded: false,
        allIn: false,
        hasActedThisRound: false,
        position: null,
        seatIndex: index,
        buyIn: initialStack,
        isSittingOut: false,
        isSittingOutNextHand: false,
        isDeletedNextHand: false,
    }));

    // ポジションを設定
    assignPositions(players, dealerIndex);

    return {
        phase: 'SETUP',
        players,
        dealerIndex,
        currentPlayerIndex: -1,
        pots: [{ amount: 0, eligiblePlayerIds: players.map(p => p.id) }],
        currentBet: 0,
        minRaise: bigBlind,
        lastRaiseAmount: bigBlind,
        communityCardCount: 0,
        handNumber: 0,
        actionHistory: [],
        showPhaseNotifications: true,
        isShowdownResolved: false,
        lastTotalPot: 0,
        smallBlind,
        bigBlind,
    };
}

/**
 * ポジション（D/SB/BB）を割り当て
 */
function assignPositions(players: Player[], dealerIndex: number): void {
    const numPlayers = players.length;

    players.forEach(p => p.position = null);

    if (numPlayers === 2) {
        // ヘッズアップ: ディーラーがSB、相手がBB
        players[dealerIndex].position = 'D';
        players[(dealerIndex + 1) % 2].position = 'BB';
    } else {
        players[dealerIndex].position = 'D';
        players[(dealerIndex + 1) % numPlayers].position = 'SB';
        players[(dealerIndex + 2) % numPlayers].position = 'BB';
    }
}

/**
 * ハンドを開始（ブラインド徴収）
 */
export function startHand(state: GameState): GameState {
    const newState = { ...state };
    const numPlayers = newState.players.length;

    // 全プレイヤーをリセット
    newState.players = newState.players.map(p => ({
        ...p,
        currentBet: 0,
        totalBetThisRound: 0,
        folded: p.stack === 0 || p.isSittingOut, // Stack 0 or SittingOut means they are folded/out
        allIn: false,
        hasActedThisRound: p.stack === 0 || p.isSittingOut, // Don't act if out
    }));

    // Find active players for Blinds
    const activePlayers = newState.players.filter(p => !p.isSittingOut && p.stack > 0);
    // If fewer than 2 active players, cannot start normally? 
    // Usually game loops until enough. But for now let's proceed, bettingEngine handles fold.

    // ブラインドを徴収 - 離席中プレイヤーはスキップ（ディーラー位置ベースで次のParticipating Playerを探す）
    // Helper to find next participating player index
    const getNextActivePlayerIndex = (startIndex: number) => {
        let idx = (startIndex + 1) % numPlayers;
        let count = 0;
        while (count < numPlayers) {
            const p = newState.players[idx];
            if (!p.isSittingOut && p.stack > 0) return idx;
            idx = (idx + 1) % numPlayers;
            count++;
        }
        return -1; // No active players
    };

    // Need to find logical SB and BB positions relative to Dealer, skipping sit-outs
    let currentIdx = newState.dealerIndex;

    // SB is next active player after Dealer
    const sbIndex = numPlayers === 2 ? currentIdx : getNextActivePlayerIndex(currentIdx);

    // BB is next active after SB
    const bbIndex = sbIndex === -1 ? -1 : getNextActivePlayerIndex(sbIndex);

    // Special Heads-up rule: Dealer is SB, Other is BB?
    // If 2 active players:
    // With 2 players: 
    // D(SB) -> BB
    // If more than 2 at table but only 2 active?
    // General rule: Small Blind is usually left of dealer.
    // In Heads up: Dealer is SB.
    // Let's stick to standard ring game logic first, adapt if needed.
    // Standard: SB is left of Btn. BB is left of SB.
    // Heads Up: Btn is SB. Non-Btn is BB.

    let actualSbIndex = sbIndex;
    let actualBbIndex = bbIndex;

    const activeCount = newState.players.filter(p => !p.isSittingOut && p.stack > 0).length;

    if (activeCount === 2) {
        // Heads up logic among active players
        // Find the two active players
        // In HU, Dealer posts SB.
        // Dealer index might be pointing to a sitting out player?
        // Dealer button stays at seat.
        // We need the "Effective Dealer" for the hand? 
        // Usually Dealer button is physical. 
        // If Dealer is sitting out, the button is still there. 
        // SB is the first active player to the left of Dealer. 
        // In HU (2 active): The active player closest to Left of Dealer is SB?
        // Wait, strictly:
        // Alice(D), Bob. Alice SB, Bob BB.
        // Alice(D), Bob(Sit), Charlie. Alice(D)... Charlie(SB)?
        // Let's implement robust visual "SB"/"BB" placement.

        // For now, simplify: 
        // 1. Find the first active player after Dealer Button -> SB (unless HU)
        // 2. Find next active -> BB

        // Fix for HU: 
        // If only 2 active players:
        // The one who has the Button (or closest previous to Button) is SB?
        // If Alice(D) and Bob are playing. Alice is SB.
        // If Alice(D) sits out. Bob and Charlie play. 
        // Button is at Alice. 
        // Bob is Left of Alice. Bob is SB. Charlie is BB.
        // This is standard.

        // So "Dealer is SB" only applies if the Dealer IS PLAYING.

        // Logic:
        // Find first active player starting from Dealer index (inclusive if playing, exclusive if not?)
        // Standard rule: SB is next player.
        // HU Exception: Button behaves differently.

        // Let's follow standard simply: 
        // SB is first active after Dealer.
        // BB is next after that.
        // (Ignore specialized HU Btn=SB rule for mixed tables to avoid complexity, unless strictly requested).
        // Actually, if I ignore HU rule, with 2 players:
        // D=0, 1. SB=1, BB=0? No.
        // D=0. Next=1. SB=1. Next=0. BB=0.
        // In HU, Dealer acts first preflop (because they are SB).
        // If I make SB=1, BB=0. Preflop order: UTG?
        // In HU, SB acts first.

        // Let's leave existing generic 2p logic: "Heads up: Dealer is SB".
        // But only if Dealer is active.
        const dealerPlayer = newState.players[newState.dealerIndex];
        const dealerIsActive = !dealerPlayer.isSittingOut && dealerPlayer.stack > 0;

        if (dealerIsActive) {
            actualSbIndex = newState.dealerIndex; // Dealer is SB
            actualBbIndex = getNextActivePlayerIndex(newState.dealerIndex); // Other is BB
        } else {
            // Dealer sitting out.
            // Fallback to standard: Next active is SB.
            actualSbIndex = getNextActivePlayerIndex(newState.dealerIndex);
            actualBbIndex = getNextActivePlayerIndex(actualSbIndex);
        }
    } else {
        // 3+ players
        actualSbIndex = getNextActivePlayerIndex(newState.dealerIndex);
        actualBbIndex = getNextActivePlayerIndex(actualSbIndex);
    }

    // SB徴収
    if (actualSbIndex !== -1) {
        const sbPlayer = newState.players[actualSbIndex];
        let sbAmount = 0;
        if (sbPlayer.stack > 0) {
            sbAmount = Math.min(newState.smallBlind, sbPlayer.stack);
            newState.players[actualSbIndex] = {
                ...sbPlayer,
                stack: sbPlayer.stack - sbAmount,
                currentBet: sbAmount,
                totalBetThisRound: sbAmount,
                allIn: sbPlayer.stack - sbAmount === 0,
            };
        }
    }

    // BB徴収
    if (actualBbIndex !== -1) {
        const bbPlayer = newState.players[actualBbIndex];
        let bbAmount = 0;
        if (bbPlayer.stack > 0) {
            bbAmount = Math.min(newState.bigBlind, bbPlayer.stack);
            newState.players[actualBbIndex] = {
                ...bbPlayer,
                stack: bbPlayer.stack - bbAmount,
                currentBet: bbAmount,
                totalBetThisRound: bbAmount,
                allIn: bbPlayer.stack - bbAmount === 0,
            };
        }
    }

    // プリフロップ開始、BBの次（UTG）から
    // Note: If HU, Dealer(SB) acts first. 
    // Preflop Action Order:
    // 3+ players: Left of BB acts first.
    // 2 players: SB acts first.

    let utgIndex = -1;
    if (activeCount === 2) {
        utgIndex = actualSbIndex; // SB acts first in HU
    } else {
        utgIndex = getNextActivePlayerIndex(actualBbIndex);
    }


    newState.phase = 'PREFLOP';
    newState.currentBet = newState.bigBlind;
    newState.minRaise = newState.bigBlind;
    newState.lastRaiseAmount = newState.bigBlind;
    newState.currentPlayerIndex = utgIndex;
    newState.communityCardCount = 0;
    newState.handNumber += 1;
    // Calculate initial pot from all players (some might have posted blind and then left? Unlikely in this synchronous flow)
    const initialPotAmount = newState.players.reduce((sum, p) => sum + (p.currentBet || 0), 0);
    newState.pots = [{ amount: initialPotAmount, eligiblePlayerIds: newState.players.filter(p => !p.folded).map(p => p.id) }];
    newState.actionHistory = [];
    newState.isShowdownResolved = false;  // 新ハンド開始時にリセット

    return newState;
}

/**
 * 次のフェーズに進む
 */
export function advancePhase(state: GameState): GameState {
    const newState = { ...state };
    const activePlayers = newState.players.filter(p => !p.folded);

    // ポットを計算して集約
    const sidePots = calculateSidePots(newState.players);
    if (sidePots.length > 0) {
        newState.pots = sidePots;
    } else {
        // 既存ポットにベット額を追加
        const totalBets = newState.players.reduce((sum, p) => sum + p.currentBet, 0);
        newState.pots[0].amount += totalBets;
    }

    // 1人しか残っていない場合はショーダウンへ
    // ポット集約後にチェックすることで、降りたプレイヤーのチップも回収される
    if (activePlayers.length === 1) {
        newState.phase = 'SHOWDOWN';

        // currentBetのリセット等は下の処理で行われるが、ここでreturnするため手動でリセットが必要か？
        // いいえ、ここでreturnする場合、currentBetは0であるべきだが、
        // ショーダウンへの遷移時は potCalculator で全部処理済みならOK。
        // ただし、この関数の後半で行っている reset logic (lines 168-173) も適用しておくと安全。

        newState.players = newState.players.map(p => ({
            ...p,
            currentBet: 0,
            hasActedThisRound: false,
        }));
        newState.currentBet = 0;

        return newState;
    }

    // 各プレイヤーの currentBet と hasActedThisRound をリセット
    newState.players = newState.players.map(p => ({
        ...p,
        currentBet: 0,
        hasActedThisRound: false,
    }));

    newState.currentBet = 0;
    newState.minRaise = newState.bigBlind;
    newState.lastRaiseAmount = newState.bigBlind;

    // フェーズ遷移
    const phaseOrder: GamePhase[] = ['PREFLOP', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN'];
    const currentPhaseIndex = phaseOrder.indexOf(newState.phase);
    newState.phase = phaseOrder[currentPhaseIndex + 1];
    newState.communityCardCount = COMMUNITY_CARDS_COUNT[newState.phase];

    // ディーラーの次のプレイヤーから開始（ポストフロップ）
    if (newState.phase !== 'SHOWDOWN') {
        let startIndex = (newState.dealerIndex + 1) % newState.players.length;
        // フォールドまたはオールインでないプレイヤーを探す
        let searchAttempts = 0;
        while (searchAttempts < newState.players.length) {
            const player = newState.players[startIndex];
            if (!player.folded && !player.allIn) {
                break;
            }
            startIndex = (startIndex + 1) % newState.players.length;
            searchAttempts++;
        }
        newState.currentPlayerIndex = startIndex;

        // 全員オールインの場合はショーダウンまで進む
        const canAct = newState.players.filter(p => !p.folded && !p.allIn);
        if (canAct.length <= 1) {
            return advancePhase(newState);
        }
    }

    return newState;
}

/**
 * 次のハンドへ（ディーラーボタン移動）
 */
export function nextHand(state: GameState, winnerIds: string[]): GameState {
    const newState = { ...state };

    // ディーラーを次のプレイヤーへ
    let nextDealerIndex = (newState.dealerIndex + 1) % newState.players.length;

    // スタックが0のプレイヤーはスキップ
    while (newState.players[nextDealerIndex].stack === 0) {
        nextDealerIndex = (nextDealerIndex + 1) % newState.players.length;
    }

    newState.dealerIndex = nextDealerIndex;

    // ポジションを再割り当て
    assignPositions(newState.players, nextDealerIndex);

    // 破産したプレイヤーを除く残りプレイヤーでゲーム継続可能かチェック
    const playersWithStack = newState.players.filter(p => p.stack > 0);
    if (playersWithStack.length < 2) {
        // ゲーム終了
        newState.phase = 'SETUP';
        return newState;
    }

    return newState;
}

/**
 * ベッティングラウンド終了をチェックし、必要なら次のフェーズへ
 */
export function checkAndAdvance(state: GameState): GameState {
    if (isBettingRoundComplete(state.players, state.currentBet)) {
        return advancePhase(state);
    }
    return state;
}

/**
 * 手番を次のプレイヤーへ
 */
export function moveToNextPlayer(state: GameState): GameState {
    const nextIndex = getNextPlayerIndex(state.players, state.currentPlayerIndex);

    if (nextIndex === -1) {
        // 全員がアクションできない -> フェーズ終了
        return advancePhase(state);
    }

    return {
        ...state,
        currentPlayerIndex: nextIndex,
    };
}
