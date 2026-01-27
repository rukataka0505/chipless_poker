const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
    output: 'standalone',
    eslint: {
        // デプロイ時のビルドエラーを防ぐため
        ignoreDuringBuilds: true,
    },
};

module.exports = withPWA(nextConfig);
