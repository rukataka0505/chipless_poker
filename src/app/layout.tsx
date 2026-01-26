import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
    metadataBase: new URL('https://chipless-poker.web.app'),
    title: 'リアルポーカー | 手持ちのトランプで仲間とポーカーを楽しもう',
    description: 'チップがなくても、トランプ1組でいつでもポーカー',
    openGraph: {
        title: 'リアルポーカー | 手持ちのトランプで仲間とポーカーを楽しもう',
        description: 'チップがなくても、トランプ1組でいつでもポーカー',
        siteName: 'リアルポーカー',
        locale: 'ja_JP',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'リアルポーカー | 手持ちのトランプで仲間とポーカーを楽しもう',
        description: 'チップがなくても、トランプ1組でいつでもポーカー',
    },
};

import { OrientationGuard } from '@/components/OrientationGuard';
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ja">
            <body className={`${inter.variable} ${outfit.variable} font-sans`}>
                <OrientationGuard />
                {children}
            </body>
        </html>
    );
}
