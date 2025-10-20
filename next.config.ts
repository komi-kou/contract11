import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ビルド最適化
  experimental: {
    optimizePackageImports: ['html2canvas', 'jspdf', 'date-fns', 'lucide-react'],
  },
  
  // バンドルサイズの最適化
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // クライアントサイドでのみ必要なライブラリを動的インポート
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    // バンドル分析用
    if (process.env.ANALYZE === 'true') {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
  
  // 圧縮設定
  compress: true,
  
  // 画像最適化
  images: {
    unoptimized: false,
  },
  
  // パフォーマンス最適化
  poweredByHeader: false,
};

export default nextConfig;
