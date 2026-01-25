import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
    metadataBase: new URL('https://chipless-poker.web.app'),
    title: 'Chipless Poker | 手持ちのトランプでポーカー',
    description: 'チップがなくても、トランプ1組でいつでもポーカー',
    openGraph: {
        title: 'Chipless Poker | 手持ちのトランプでポーカー',
        description: 'チップがなくても、トランプ1組でいつでもポーカー',
        siteName: 'Chipless Poker',
        locale: 'ja_JP',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Chipless Poker | 手持ちのトランプでポーカー',
        description: 'チップがなくても、トランプ1組でいつでもポーカー',
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
