// Poker Game Types

export type GamePhase =
    | 'SETUP'      // 初期設定
    | 'PREFLOP'    // プリフロップ
    | 'FLOP'       // フロップ
    | 'TURN'       // ターン
    | 'RIVER'      // リバー
    | 'SHOWDOWN';  // ショーダウン

export type PlayerAction =
    | 'FOLD'
    | 'CHECK'
    | 'CALL'
    | 'BET'
    | 'RAISE'
    | 'ALL_IN';

export type Position = 'D' | 'SB' | 'BB' | null;

export interface Player {
    id: string;
    name: string;
    stack: number;          // 現在のスタック
    currentBet: number;     // 現在のベット額
    totalBetThisRound: number; // このラウンドでの合計ベット
    folded: boolean;
    allIn: boolean;
    hasActedThisRound: boolean; // このラウンドでアクションしたか
    position: Position;
    seatIndex: number;      // 座席位置 (0-5)
}

export interface Pot {
    amount: number;
    eligiblePlayerIds: string[];  // このポットに参加できるプレイヤーID
}

export interface GameState {
    phase: GamePhase;
    players: Player[];
    dealerIndex: number;        // ディーラーボタンの位置
    currentPlayerIndex: number; // 現在の手番プレイヤー
    pots: Pot[];                // メインポット + サイドポット
    currentBet: number;         // 現在のコールに必要な金額
    minRaise: number;           // 最小レイズ額
    lastRaiseAmount: number;    // 直前のレイズ額
    communityCardCount: number; // コミュニティカードの枚数
    handNumber: number;         // ハンド番号
    actionHistory: ActionRecord[];
    showPhaseNotifications: boolean; // フェーズ遷移通知を表示するかどうか
    isShowdownResolved: boolean;     // ショーダウンが解決済み（チップ配分済み）かどうか
    lastTotalPot: number;            // ショーダウンまたは勝利時の総ポット額
    smallBlind: number;             // 現在のスモールブラインド
    bigBlind: number;               // 現在のビッグブラインド
}

export interface ActionRecord {
    playerId: string;
    action: PlayerAction;
    amount?: number;
    timestamp: number;
}

// ハンド履歴（将来の履歴表示機能用）
export interface HandHistory {
    handNumber: number;
    actions: ActionRecord[];
    finalState: GameState;  // ハンド終了時の状態
}

// ゲーム定数
export const GAME_CONSTANTS = {
    INITIAL_STACK: 200,
    SMALL_BLIND: 1,
    BIG_BLIND: 2,
    MIN_PLAYERS: 2,
    MAX_PLAYERS: 9,
} as const;

// フェーズ別のディーラー指示
export const DEALER_INSTRUCTIONS: Record<GamePhase, string> = {
    SETUP: 'プレイヤー情報を入力してください',
    PREFLOP: '各プレイヤーに2枚ずつ配ってください',
    FLOP: '1枚バーンして、3枚のフロップを開いてください',
    TURN: '1枚バーンして、ターンを1枚開いてください',
    RIVER: '1枚バーンして、リバーを1枚開いてください',
    SHOWDOWN: '残っているプレイヤーはハンドをオープンしてください',
};

// コミュニティカード枚数
export const COMMUNITY_CARDS_COUNT: Record<GamePhase, number> = {
    SETUP: 0,
    PREFLOP: 0,
    FLOP: 3,
    TURN: 4,
    RIVER: 5,
    SHOWDOWN: 5,
};
