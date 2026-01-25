const nextConfig = {
    output: 'standalone',
    eslint: {
        // デプロイ時のビルドエラーを防ぐため
        ignoreDuringBuilds: true,
    },
};

module.exports = nextConfig;
