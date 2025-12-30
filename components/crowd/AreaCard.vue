<script setup lang="ts">
import type { AreaStatus, DensityLevel } from '~/types'
import { getDensityLevel } from '~/types'

interface Props {
  area: AreaStatus
}

const props = defineProps<Props>()

const densityLevel = computed((): DensityLevel => getDensityLevel(props.area.density))

const densityPercent = computed(() => Math.round(props.area.density * 100))
const stagnationPercent = computed(() => Math.round(props.area.stagnationRate * 100))

const progressClass = computed(() => {
  const classes: Record<DensityLevel, string> = {
    low: 'progress-safe',
    moderate: 'progress-warning',
    high: 'progress-danger',
    critical: 'progress-critical',
  }
  return classes[densityLevel.value]
})

const trendIcon = computed(() => {
  const icons: Record<string, string> = {
    increasing: '↑',
    stable: '→',
    decreasing: '↓',
  }
  return icons[props.area.trend]
})

const trendClass = computed(() => {
  const classes: Record<string, string> = {
    increasing: 'trend-up',
    stable: 'trend-stable',
    decreasing: 'trend-down',
  }
  return classes[props.area.trend]
})
</script>

<template>
  <div class="area-card card">
    <div class="area-header">
      <h3 class="area-name">{{ area.areaName }}</h3>
      <UiStatusBadge :level="densityLevel" />
    </div>

    <div class="area-stats">
      <div class="stat-row">
        <span class="stat-label">混雑度</span>
        <span class="stat-value font-mono">{{ densityPercent }}%</span>
      </div>
      <div class="progress">
        <div 
          class="progress-bar" 
          :class="progressClass"
          :style="{ width: `${densityPercent}%` }"
        />
      </div>
    </div>

    <div class="area-details">
      <div class="detail-item">
        <span class="detail-label">現在</span>
        <span class="detail-value font-mono">{{ area.currentCount.toLocaleString() }}人</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">滞留率</span>
        <span class="detail-value font-mono" :class="{ 'text-danger': stagnationPercent > 50 }">
          {{ stagnationPercent }}%
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">傾向</span>
        <span class="detail-value trend" :class="trendClass">
          {{ trendIcon }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.area-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.area-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.area-name {
  font-size: 1rem;
  font-weight: 700;
}

.area-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
}

.area-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--border-color);
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.detail-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.9rem;
  font-weight: 600;
}

.text-danger {
  color: var(--status-danger);
}

.trend {
  font-size: 1.25rem;
  font-weight: 700;
}

.trend-up {
  color: var(--status-danger);
}

.trend-stable {
  color: var(--status-warning);
}

.trend-down {
  color: var(--status-safe);
}
</style>
