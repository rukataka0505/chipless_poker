import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
    metadataBase: new URL('https://chipless-poker.web.app'),
    title: 'どこでもポーカー | 手持ちのトランプでポーカー',
    description: 'チップがなくても、トランプ1組でいつでもポーカー',
    manifest: '/manifest.json',
    icons: {
        icon: '/favicon.png',
        apple: '/icon-192x192.png',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'どこでもポーカー',
    },
    openGraph: {
        title: 'どこでもポーカー | 手持ちのトランプでポーカー',
        description: 'チップがなくても、トランプ1組でいつでもポーカー',
        siteName: 'どこでもポーカー',
        locale: 'ja_JP',
        type: 'website',
        images: [
            {
                url: '/ogp.png',
                width: 1200,
                height: 630,
                alt: 'どこでもポーカー',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'どこでもポーカー | 手持ちのトランプでポーカー',
        description: 'チップがなくても、トランプ1組でいつでもポーカー',
        images: ['/ogp.png'],
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
