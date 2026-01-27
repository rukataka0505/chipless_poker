# どこでもポーカー (Chipless Poker)

トランプ1組でチップなしでもポーカーができるPWAアプリです。

## Features

- **完全オフライン対応**: インターネット接続なしで動作
- **データ自動保存**: ブラウザを閉じてもゲーム状態が保持（localStorage）
- **PWAインストール**: ホーム画面に追加してアプリのように使用可能
- **Undo機能**: 誤操作を取り消し可能

## Offline Functionality

- ゲーム状態は `localStorage` に自動保存されます
- ブラウザをリロードしてもゲームは中断したところから再開可能
- Service Workerにより全アセットがキャッシュされ、オフラインでも動作

## Tech Stack

- **Framework**: Next.js 14 (Static Export)
- **State Management**: Zustand (with persist middleware)
- **PWA**: next-pwa
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production (static export to out/)
npm run build
```

## Deployment

ビルド後、`out/` ディレクトリの内容を任意の静的ホスティングサービスにデプロイできます。
