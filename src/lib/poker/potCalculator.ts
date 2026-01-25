/**
 * Pot Calculator - サイドポット計算エンジン
 * UIから完全に分離されたピュア関数として実装
 */

import { Player, Pot } from './types';

/**
 * オールイン発生時のサイドポット計算
 * 各プレイヤーのベット額に基づいてポットを分割
 */
export function calculateSidePots(players: Player[]): Pot[] {
    // アクティブなプレイヤー（フォールドしていない）のみ対象
    const activePlayers = players.filter(p => !p.folded);

    if (activePlayers.length === 0) {
        return [];
    }

    // 各プレイヤーのこのラウンドでの合計ベット額を取得
    const bets = activePlayers.map(p => ({
        playerId: p.id,
        bet: p.totalBetThisRound,
        allIn: p.allIn,
    }));

    // ベット額でソート
    const sortedBets = [...bets].sort((a, b) => a.bet - b.bet);

    const pots: Pot[] = [];
    let processedAmount = 0;

    for (let i = 0; i < sortedBets.length; i++) {
        const currentBet = sortedBets[i].bet;
        const betDiff = currentBet - processedAmount;

        if (betDiff > 0) {
            // このレベルに参加できるプレイヤー数
            const eligiblePlayers = sortedBets
                .filter(b => b.bet >= currentBet)
                .map(b => b.playerId);

            // 全員がこのレベルまで拠出している金額
            const potAmount = betDiff * sortedBets.filter(b => b.bet >= currentBet || b.bet > processedAmount).length;

            if (potAmount > 0) {
                pots.push({
                    amount: potAmount,
                    eligiblePlayerIds: eligiblePlayers,
                });
            }
        }

        processedAmount = currentBet;
    }

    // 同じ参加者のポットをマージ
    return mergeSamePots(pots);
}

/**
 * 同じ参加者リストを持つポットをマージ
 */
function mergeSamePots(pots: Pot[]): Pot[] {
    const merged: Pot[] = [];

    for (const pot of pots) {
        const existing = merged.find(p =>
            p.eligiblePlayerIds.length === pot.eligiblePlayerIds.length &&
            p.eligiblePlayerIds.every(id => pot.eligiblePlayerIds.includes(id))
        );

        if (existing) {
            existing.amount += pot.amount;
        } else {
            merged.push({ ...pot });
        }
    }

    return merged;
}

/**
 * 勝者にポットを配分
 * @param pots 現在のポット配列
 * @param winners ポットインデックス -> 勝者ID配列 のマップ（チョップ対応）
 * @returns 各プレイヤーへの配分額のマップ
 */
export function distributePots(
    pots: Pot[],
    winners: Map<number, string[]>
): Map<string, number> {
    const distribution = new Map<string, number>();

    for (let i = 0; i < pots.length; i++) {
        const pot = pots[i];
        const potWinners = winners.get(i) || [];

        if (potWinners.length === 0) {
            continue;
        }

        // チョップの場合は均等分配
        const sharePerWinner = Math.floor(pot.amount / potWinners.length);
        const remainder = pot.amount % potWinners.length;

        potWinners.forEach((winnerId, index) => {
            const current = distribution.get(winnerId) || 0;
            // 余りは最初の勝者に付与
            const extra = index < remainder ? 1 : 0;
            distribution.set(winnerId, current + sharePerWinner + extra);
        });
    }

    return distribution;
}

/**
 * 現在のポット合計を計算
 */
export function calculateTotalPot(pots: Pot[]): number {
    return pots.reduce((sum, pot) => sum + pot.amount, 0);
}

/**
 * プレイヤーの総ベット額を計算
 */
export function calculateTotalBets(players: Player[]): number {
    return players.reduce((sum, p) => sum + p.totalBetThisRound, 0);
}
