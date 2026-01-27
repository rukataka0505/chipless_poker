const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
    output: 'export',
    eslint: {
        // デプロイ時のビルドエラーを防ぐため
        ignoreDuringBuilds: true,
    },
    images: {
        // 静的エクスポートではNext.js画像最適化が使えないため
        unoptimized: true,
    },
};

module.exports = withPWA(nextConfig);
