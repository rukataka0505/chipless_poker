import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
    metadataBase: new URL('https://chipless-poker.web.app'),
    title: 'どこでもポーカー | チップ計算アプリ',
    description: 'チップがなくても、トランプ1組でいつでもポーカー',
    keywords: [
        'ポーカー チップ 代用',
        'ポーカー チップ 計算 アプリ',
        'トランプだけ ポーカー',
        'テキサスホールデム チップ管理',
        'ポーカー アプリ 無料',
        'チップなし ポーカー',
        'ポーカー 1デバイス',
        'PWA ポーカー',
    ],
    manifest: '/manifest.json',
    icons: {
        icon: [
            { url: '/favicon.png', type: 'image/png' },
        ],
        shortcut: '/favicon.png',
        apple: '/icon-192x192.png',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'どこでもポーカー',
    },
    openGraph: {
        title: 'どこでもポーカー | チップ計算アプリ',
        description: 'チップがなくても、トランプ1組でいつでもポーカー',
        siteName: 'どこでもポーカー',
        locale: 'ja_JP',
        type: 'website',
        images: [
            {
                url: 'https://chipless-poker.web.app/ogp.png',
                width: 1200,
                height: 630,
                alt: 'どこでもポーカー',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'どこでもポーカー | チップ計算アプリ',
        description: 'チップがなくても、トランプ1組でいつでもポーカー',
        images: [
            {
                url: 'https://chipless-poker.web.app/ogp.png',
                width: 1200,
                height: 630,
                alt: 'どこでもポーカー',
            },
        ],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja">
            <body className={`${inter.variable} ${outfit.variable} font-sans`}>{children}</body>
        </html>
    );
}
