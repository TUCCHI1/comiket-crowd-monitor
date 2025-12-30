// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Nuxt 4 互換モード
  future: {
    compatibilityVersion: 4,
  },

  compatibilityDate: '2024-12-01',

  // SPAモード（PWA向け）
  ssr: false,

  // 開発ツール
  devtools: { enabled: true },

  // モジュール
  modules: [
    '@vite-pwa/nuxt',
  ],

  // PWA設定
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'コミケ混雑モニター',
      short_name: 'ComiMonitor',
      description: 'コミケ会場の混雑状況をリアルタイムで把握',
      theme_color: '#0a0a0f',
      background_color: '#0a0a0f',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module',
    },
  },

  // グローバルCSS
  css: ['~/assets/css/main.css'],

  // アプリ設定
  app: {
    head: {
      title: 'コミケ混雑モニター',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0a0a0f' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/icons/icon-192.png' },
      ],
    },
  },

  // Nitroサーバー設定
  nitro: {
    experimental: {
      websocket: true,
    },
  },

  // ランタイム設定
  runtimeConfig: {
    public: {
      // 位置情報送信間隔（ミリ秒）
      locationInterval: 30000,
      // 滞留判定時間（分）
      stagnationThreshold: 5,
    },
  },
})
