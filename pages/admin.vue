<script setup lang="ts">
const {
  crowdData,
  isLoading,
  error,
  areasByHall,
  criticalAreas,
  activeAlerts,
  startPolling,
  refresh,
} = useCrowdData(3000) // 3秒ごとに更新

// ダッシュボード開始時にポーリング開始
onMounted(() => {
  startPolling()
})

// 全体の統計
const totalStats = computed(() => {
  if (!crowdData.value) {
    return { total: 0, avgDensity: 0, criticalCount: 0 }
  }
  const areas = crowdData.value.areas
  const avgDensity = areas.reduce((acc, a) => acc + a.density, 0) / areas.length
  return {
    total: crowdData.value.totalVisitors,
    avgDensity: Math.round(avgDensity * 100),
    criticalCount: areas.filter(a => a.density > 0.85).length,
  }
})

// 現在時刻
const currentTime = ref(new Date())
let timeInterval: ReturnType<typeof setInterval>

onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timeInterval)
})

const formattedTime = computed(() => {
  return currentTime.value.toLocaleTimeString('ja-JP')
})

const formattedDate = computed(() => {
  return currentTime.value.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
})

// タブ切り替え
const activeTab = ref<'map' | 'list'>('map')
</script>

<template>
  <div class="dashboard">
    <div class="container">
      <!-- ヘッダー -->
      <header class="dashboard-header">
        <div class="header-left">
          <h1 class="dashboard-title">
            <span class="title-icon">📊</span>
            コミケ混雑モニター
          </h1>
          <span class="dashboard-badge">運営用ダッシュボード</span>
        </div>
        <div class="header-right">
          <div class="datetime">
            <span class="time font-mono">{{ formattedTime }}</span>
            <span class="date">{{ formattedDate }}</span>
          </div>
          <button class="btn btn-outline" @click="refresh">
            🔄 更新
          </button>
        </div>
      </header>

      <!-- ローディング -->
      <div v-if="isLoading && !crowdData" class="loading-state">
        <div class="loading-spinner" />
        <p>データを読み込んでいます...</p>
      </div>

      <!-- エラー -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="refresh">再試行</button>
      </div>

      <!-- メインコンテンツ -->
      <main v-else-if="crowdData" class="dashboard-main">
        <!-- 統計サマリー -->
        <section class="stats-section stagger">
          <div class="stat-card card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <span class="stat-value font-mono">{{ totalStats.total.toLocaleString() }}</span>
              <span class="stat-label">総来場者数</span>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <span class="stat-value font-mono">{{ totalStats.avgDensity }}%</span>
              <span class="stat-label">平均混雑度</span>
            </div>
          </div>
          <div class="stat-card card" :class="{ 'stat-alert': totalStats.criticalCount > 0 }">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <span class="stat-value font-mono">{{ totalStats.criticalCount }}</span>
              <span class="stat-label">危険エリア数</span>
            </div>
          </div>
          <div class="stat-card card">
            <div class="stat-icon">🚨</div>
            <div class="stat-content">
              <span class="stat-value font-mono">{{ activeAlerts.length }}</span>
              <span class="stat-label">アクティブ警告</span>
            </div>
          </div>
        </section>

        <!-- アラートセクション -->
        <section v-if="activeAlerts.length > 0" class="alerts-section">
          <h2 class="section-title">
            <span class="title-icon">🚨</span>
            滞留アラート
          </h2>
          <div class="alerts-list stagger">
            <CrowdStagnationAlert
              v-for="alert in activeAlerts"
              :key="alert.id"
              :alert="alert"
            />
          </div>
        </section>

        <!-- タブナビゲーション -->
        <div class="tab-nav">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'map' }"
            @click="activeTab = 'map'"
          >
            🗺️ マップビュー
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'list' }"
            @click="activeTab = 'list'"
          >
            📋 リストビュー
          </button>
        </div>

        <!-- マップビュー -->
        <section v-if="activeTab === 'map'" class="map-section">
          <CrowdHeatMap :areas="crowdData.areas" />
        </section>

        <!-- リストビュー -->
        <section v-if="activeTab === 'list'" class="list-section">
          <!-- 危険エリア（優先表示） -->
          <div v-if="criticalAreas.length > 0" class="area-group">
            <h3 class="group-title danger">
              <span>🔴</span> 危険エリア
            </h3>
            <div class="area-grid stagger">
              <CrowdAreaCard
                v-for="area in criticalAreas"
                :key="area.areaId"
                :area="area"
              />
            </div>
          </div>

          <!-- 東ホール -->
          <div class="area-group">
            <h3 class="group-title">
              <span>🏛️</span> 東ホール
            </h3>
            <div class="area-grid stagger">
              <CrowdAreaCard
                v-for="area in areasByHall.east"
                :key="area.areaId"
                :area="area"
              />
            </div>
          </div>

          <!-- 西ホール -->
          <div class="area-group">
            <h3 class="group-title">
              <span>🏛️</span> 西ホール
            </h3>
            <div class="area-grid stagger">
              <CrowdAreaCard
                v-for="area in areasByHall.west"
                :key="area.areaId"
                :area="area"
              />
            </div>
          </div>

          <!-- 南ホール -->
          <div class="area-group">
            <h3 class="group-title">
              <span>🏛️</span> 南ホール
            </h3>
            <div class="area-grid stagger">
              <CrowdAreaCard
                v-for="area in areasByHall.south"
                :key="area.areaId"
                :area="area"
              />
            </div>
          </div>
        </section>

        <!-- 最終更新時刻 -->
        <footer class="dashboard-footer">
          <p class="last-updated">
            最終更新: {{ new Date(crowdData.lastUpdated).toLocaleTimeString('ja-JP') }}
          </p>
          <NuxtLink to="/" class="back-link">← 入場者画面に戻る</NuxtLink>
        </footer>
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: var(--space-lg) 0;
  background: 
    radial-gradient(ellipse at top, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
    var(--bg-primary);
}

/* ヘッダー */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
  gap: var(--space-md);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.title-icon {
  font-size: 1.25em;
}

.dashboard-badge {
  background: var(--gradient-glow);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.datetime {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.time {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-cyan);
}

.date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* ローディング・エラー */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: var(--space-md);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-cyan);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 統計セクション */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

@media (max-width: 1024px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-section {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.stat-card.stat-alert {
  border-color: var(--status-danger);
  background: rgba(239, 68, 68, 0.1);
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 900;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: var(--space-xs);
}

/* アラートセクション */
.alerts-section {
  margin-bottom: var(--space-xl);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* タブナビゲーション */
.tab-nav {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--space-sm);
}

.tab-btn {
  padding: var(--space-sm) var(--space-md);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-tertiary);
}

.tab-btn.active {
  color: var(--accent-cyan);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-bottom-color: var(--bg-card);
  margin-bottom: -1px;
}

/* マップセクション */
.map-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
}

/* リストセクション */
.list-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
}

.area-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.group-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.group-title.danger {
  color: var(--status-danger);
}

.area-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

@media (max-width: 1024px) {
  .area-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .area-grid {
    grid-template-columns: 1fr;
  }
}

/* フッター */
.dashboard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-color);
}

.last-updated {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.back-link {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.back-link:hover {
  color: var(--accent-cyan);
}
</style>
