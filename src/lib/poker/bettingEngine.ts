/**
 * Betting Engine - ベッティングロジック
 * アクションの検証と処理を担当
 */

import { Player, PlayerAction, GameState, GAME_CONSTANTS } from './types';

export interface AvailableActions {
    canFold: boolean;
    canCheck: boolean;
    canCall: boolean;
    callAmount: number;
    canBet: boolean;
    canRaise: boolean;
    minBet: number;
    minRaise: number;
    maxBet: number;
}

/**
 * プレイヤーが取れるアクションを取得
 */
export function getAvailableActions(
    player: Player,
    currentBet: number,
    minRaise: number,
    bigBlind: number = GAME_CONSTANTS.BIG_BLIND
): AvailableActions {
    const toCall = currentBet - player.currentBet;
    const canAffordCall = player.stack >= toCall;

    // 基本的にフォールドは常に可能
    const canFold = true;

    // チェック可能: コールすべき金額がない場合
    const canCheck = toCall === 0;

    // コール可能: コールすべき金額があり、スタックが足りる場合
    const canCall = toCall > 0 && player.stack > 0;
    const callAmount = Math.min(toCall, player.stack);

    // ベット可能: まだ誰もベットしていない（currentBet === 0）
    const canBet = currentBet === 0 && player.stack > 0;
    const minBet = bigBlind;

    // レイズ可能: 既にベットがあり、十分なスタックがある
    const canRaise = currentBet > 0 && player.stack > toCall;
    const actualMinRaise = Math.max(minRaise, bigBlind);

    return {
        canFold,
        canCheck,
        canCall,
        callAmount,
        canBet,
        canRaise,
        minBet,
        minRaise: currentBet + actualMinRaise,
        maxBet: player.stack + player.currentBet,
    };
}

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * アクションのバリデーション
 */
export function validateAction(
    action: PlayerAction,
    amount: number | undefined,
    player: Player,
    currentBet: number,
    minRaise: number,
    bigBlind: number = GAME_CONSTANTS.BIG_BLIND
): ValidationResult {
    const available = getAvailableActions(player, currentBet, minRaise, bigBlind);

    switch (action) {
        case 'FOLD':
            return { valid: true };

        case 'CHECK':
            if (!available.canCheck) {
                return { valid: false, error: 'チェックできません。コールまたはフォールドしてください。' };
            }
            return { valid: true };

        case 'CALL':
            if (!available.canCall) {
                return { valid: false, error: 'コールする金額がありません。' };
            }
            return { valid: true };

        case 'BET':
            if (!available.canBet) {
                return { valid: false, error: 'ベットできません。' };
            }
            if (!amount || amount < available.minBet) {
                return { valid: false, error: `最小ベット額は ${available.minBet} です。` };
            }
            if (amount > player.stack) {
                return { valid: false, error: 'スタックが不足しています。' };
            }
            return { valid: true };

        case 'RAISE':
            if (!available.canRaise) {
                return { valid: false, error: 'レイズできません。' };
            }
            if (!amount || amount < available.minRaise) {
                return { valid: false, error: `最小レイズ額は ${available.minRaise} です。` };
            }
            if (amount > available.maxBet) {
                return { valid: false, error: 'スタックが不足しています。' };
            }
            return { valid: true };

        case 'ALL_IN':
            if (player.stack === 0) {
                return { valid: false, error: 'スタックがありません。' };
            }
            return { valid: true };

        default:
            return { valid: false, error: '無効なアクションです。' };
    }
}

/**
 * アクションを処理してプレイヤーの状態を更新
 */
export function processAction(
    player: Player,
    action: PlayerAction,
    amount: number | undefined,
    currentBet: number
): { updatedPlayer: Player; betAmount: number; newCurrentBet: number } {
    let betAmount = 0;
    let newCurrentBet = currentBet;
    const updatedPlayer = { ...player };

    switch (action) {
        case 'FOLD':
            updatedPlayer.folded = true;
            break;

        case 'CHECK':
            // 何もしない
            break;

        case 'CALL':
            betAmount = Math.min(currentBet - player.currentBet, player.stack);
            updatedPlayer.stack -= betAmount;
            updatedPlayer.currentBet += betAmount;
            updatedPlayer.totalBetThisRound += betAmount;
            if (updatedPlayer.stack === 0) {
                updatedPlayer.allIn = true;
            }
            break;

        case 'BET':
        case 'RAISE':
            betAmount = amount! - player.currentBet;
            updatedPlayer.stack -= betAmount;
            updatedPlayer.currentBet = amount!;
            updatedPlayer.totalBetThisRound += betAmount;
            newCurrentBet = amount!;
            if (updatedPlayer.stack === 0) {
                updatedPlayer.allIn = true;
            }
            break;

        case 'ALL_IN':
            betAmount = player.stack;
            updatedPlayer.currentBet += betAmount;
            updatedPlayer.totalBetThisRound += betAmount;
            updatedPlayer.stack = 0;
            updatedPlayer.allIn = true;
            if (updatedPlayer.currentBet > currentBet) {
                newCurrentBet = updatedPlayer.currentBet;
            }
            break;
    }

    return { updatedPlayer, betAmount, newCurrentBet };
}

/**
 * ベッティングラウンドが終了したかチェック
 */
export function isBettingRoundComplete(players: Player[], currentBet: number): boolean {
    const activePlayers = players.filter(p => !p.folded);

    // 1人しか残っていない場合は終了
    if (activePlayers.length <= 1) {
        return true;
    }

    // オールインでないアクティブプレイヤー
    const playersWhoCanAct = activePlayers.filter(p => !p.allIn);

    // 全員オールインの場合は終了
    if (playersWhoCanAct.length === 0) {
        return true;
    }

    // 全員が少なくとも1回アクションしたかチェック
    if (!playersWhoCanAct.every(p => p.hasActedThisRound)) {
        return false;
    }

    // 全員のベット額が同じかチェック（オールイン以外）
    return playersWhoCanAct.every(p => p.currentBet === currentBet);
}

/**
 * 次のプレイヤーインデックスを取得
 */
export function getNextPlayerIndex(
    players: Player[],
    currentIndex: number
): number {
    const numPlayers = players.length;
    let nextIndex = (currentIndex + 1) % numPlayers;

    // フォールドしておらず、オールインでもないプレイヤーを探す
    let attempts = 0;
    while (attempts < numPlayers) {
        const player = players[nextIndex];
        if (!player.folded && !player.allIn) {
            return nextIndex;
        }
        nextIndex = (nextIndex + 1) % numPlayers;
        attempts++;
    }

    // 全員がフォールドまたはオールイン
    return -1;
}
