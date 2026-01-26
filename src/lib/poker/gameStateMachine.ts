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
export function createInitialState(playerNames: string[]): GameState {
    const numPlayers = playerNames.length;

    // ディーラーをランダムに決定
    const dealerIndex = Math.floor(Math.random() * numPlayers);

    // プレイヤーを作成
    const players: Player[] = playerNames.map((name, index) => ({
        id: `player-${index}`,
        name,
        stack: GAME_CONSTANTS.INITIAL_STACK,
        currentBet: 0,
        totalBetThisRound: 0,
        folded: false,
        allIn: false,
        hasActedThisRound: false,
        position: null,
        seatIndex: index,
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
        minRaise: GAME_CONSTANTS.BIG_BLIND,
        lastRaiseAmount: GAME_CONSTANTS.BIG_BLIND,
        communityCardCount: 0,
        handNumber: 0,
        actionHistory: [],
        showPhaseNotifications: true,
        isShowdownResolved: false,
        lastTotalPot: 0,
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
        folded: p.stack === 0, // Stack 0 means they are busted/folded
        allIn: false,
        hasActedThisRound: p.stack === 0, // Busted players don't act
    }));

    // ブラインドを徴収
    const sbIndex = numPlayers === 2
        ? newState.dealerIndex
        : (newState.dealerIndex + 1) % numPlayers;
    const bbIndex = numPlayers === 2
        ? (newState.dealerIndex + 1) % numPlayers
        : (newState.dealerIndex + 2) % numPlayers;

    // SB徴収
    const sbPlayer = newState.players[sbIndex];
    let sbAmount = 0;
    if (sbPlayer.stack > 0) {
        sbAmount = Math.min(GAME_CONSTANTS.SMALL_BLIND, sbPlayer.stack);
        newState.players[sbIndex] = {
            ...sbPlayer,
            stack: sbPlayer.stack - sbAmount,
            currentBet: sbAmount,
            totalBetThisRound: sbAmount,
            allIn: sbPlayer.stack - sbAmount === 0,
        };
    }

    // BB徴収
    const bbPlayer = newState.players[bbIndex];
    let bbAmount = 0;
    if (bbPlayer.stack > 0) {
        bbAmount = Math.min(GAME_CONSTANTS.BIG_BLIND, bbPlayer.stack);
        newState.players[bbIndex] = {
            ...bbPlayer,
            stack: bbPlayer.stack - bbAmount,
            currentBet: bbAmount,
            totalBetThisRound: bbAmount,
            allIn: bbPlayer.stack - bbAmount === 0,
        };
    }

    // プリフロップ開始、UTGから
    let utgIndex = (bbIndex + 1) % numPlayers;

    // フォールドまたはオールインでないプレイヤーを探す
    let attempts = 0;
    while (attempts < numPlayers) {
        const player = newState.players[utgIndex];
        if (!player.folded && !player.allIn) {
            break;
        }
        utgIndex = (utgIndex + 1) % numPlayers;
        attempts++;
    }

    newState.phase = 'PREFLOP';
    newState.currentBet = GAME_CONSTANTS.BIG_BLIND;
    newState.minRaise = GAME_CONSTANTS.BIG_BLIND;
    newState.lastRaiseAmount = GAME_CONSTANTS.BIG_BLIND;
    newState.currentPlayerIndex = utgIndex;
    newState.communityCardCount = 0;
    newState.handNumber += 1;
    newState.pots = [{ amount: sbAmount + bbAmount, eligiblePlayerIds: newState.players.map(p => p.id) }];
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
    newState.minRaise = GAME_CONSTANTS.BIG_BLIND;
    newState.lastRaiseAmount = GAME_CONSTANTS.BIG_BLIND;

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
