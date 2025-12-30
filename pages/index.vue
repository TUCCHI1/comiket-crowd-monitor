<script setup lang="ts">
const { state, oderId, startTracking, stopTracking } = useGeolocation()

// 同意状態
const hasConsented = ref(false)

onMounted(() => {
  if (import.meta.client) {
    hasConsented.value = localStorage.getItem('comiket-consent') === 'true'
  }
})

const handleConsent = () => {
  hasConsented.value = true
  localStorage.setItem('comiket-consent', 'true')
}

const toggleTracking = () => {
  if (state.value.isTracking) {
    stopTracking()
  } else {
    startTracking()
  }
}

const formatTime = (timestamp: number | null): string => {
  if (!timestamp) return '--:--:--'
  return new Date(timestamp).toLocaleTimeString('ja-JP')
}
</script>

<template>
  <div class="pwa-container">
    <header class="pwa-header">
      <h1 class="pwa-title">コミケ混雑モニター</h1>
      <p class="pwa-subtitle">位置情報を共有して混雑緩和に協力</p>
    </header>

    <!-- 同意画面 -->
    <div v-if="!hasConsented" class="consent-screen">
      <div class="consent-card card">
        <div class="consent-icon">📍</div>
        <h2>位置情報の利用について</h2>
        <p>
          会場の混雑状況を把握し、安全な運営を行うために、
          あなたの位置情報を収集します。
        </p>
        <ul class="consent-list">
          <li>✓ 位置情報は匿名化されます</li>
          <li>✓ イベント終了後に削除されます</li>
          <li>✓ いつでも送信を停止できます</li>
        </ul>
        <button class="btn btn-primary btn-lg" @click="handleConsent">
          同意して開始
        </button>
        <NuxtLink to="/admin" class="admin-link">
          運営者はこちら →
        </NuxtLink>
      </div>
    </div>

    <!-- トラッキング画面 -->
    <div v-else class="pwa-status">
      <div 
        class="tracking-indicator"
        :class="{ active: state.isTracking, inactive: !state.isTracking }"
      >
        {{ state.isTracking ? '📡' : '⏸️' }}
      </div>

      <div class="status-text">
        <p class="status-main">
          {{ state.isTracking ? '位置情報を送信中' : '送信停止中' }}
        </p>
        <p v-if="state.currentArea" class="status-area">
          現在地: {{ state.currentArea.replace('east-', '東').replace('west-', '西').replace('south-', '南') }}
        </p>
        <p v-if="state.error" class="status-error">
          {{ state.error }}
        </p>
      </div>

      <button 
        class="btn btn-lg"
        :class="state.isTracking ? 'btn-danger' : 'btn-primary'"
        @click="toggleTracking"
      >
        {{ state.isTracking ? '送信を停止' : '送信を開始' }}
      </button>

      <div class="tracking-info card">
        <div class="info-row">
          <span class="info-label">ユーザーID</span>
          <span class="info-value font-mono text-xs">{{ oderId.slice(0, 16) }}...</span>
        </div>
        <div class="info-row">
          <span class="info-label">最終送信</span>
          <span class="info-value font-mono">{{ formatTime(state.lastSent) }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">送信間隔</span>
          <span class="info-value">30秒</span>
        </div>
      </div>

      <NuxtLink to="/admin" class="admin-link">
        運営ダッシュボードを見る →
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.pwa-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.pwa-title {
  font-size: 1.75rem;
  font-weight: 900;
  background: var(--gradient-glow);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-sm);
}

.pwa-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* 同意画面 */
.consent-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.consent-card {
  max-width: 360px;
  text-align: center;
}

.consent-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.consent-card h2 {
  font-size: 1.25rem;
  margin-bottom: var(--space-md);
}

.consent-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: var(--space-lg);
  line-height: 1.7;
}

.consent-list {
  list-style: none;
  text-align: left;
  margin-bottom: var(--space-xl);
}

.consent-list li {
  padding: var(--space-sm) 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.consent-list li:last-child {
  border-bottom: none;
}

/* ステータス画面 */
.pwa-status {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
  padding-bottom: var(--space-2xl);
}

.status-text {
  text-align: center;
}

.status-main {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.status-area {
  color: var(--accent-cyan);
  font-size: 0.9rem;
}

.status-error {
  color: var(--status-danger);
  font-size: 0.85rem;
  margin-top: var(--space-sm);
}

.tracking-info {
  width: 100%;
  max-width: 320px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.info-value {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.admin-link {
  margin-top: var(--space-lg);
  font-size: 0.85rem;
  color: var(--text-muted);
}

.admin-link:hover {
  color: var(--accent-cyan);
}
</style>
