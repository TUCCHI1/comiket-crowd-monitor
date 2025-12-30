<script setup lang="ts">
import type { AreaStatus, DensityLevel } from '~/types'
import { getDensityLevel, densityColors } from '~/types'

interface Props {
  areas: AreaStatus[]
}

const props = defineProps<Props>()

// エリアIDから混雑状況を取得
const getAreaStatus = (areaId: string): AreaStatus | undefined => {
  return props.areas.find(a => a.areaId === areaId)
}

// エリアの色を取得
const getAreaColor = (areaId: string): string => {
  const status = getAreaStatus(areaId)
  if (!status) return '#1a1a25'
  const level = getDensityLevel(status.density)
  return densityColors[level]
}

// エリアの不透明度
const getAreaOpacity = (areaId: string): number => {
  const status = getAreaStatus(areaId)
  if (!status) return 0.3
  return 0.4 + status.density * 0.5
}

// ホールの定義（SVG座標）
const halls = {
  east: [
    { id: 'east-1', x: 200, y: 50, width: 80, height: 100 },
    { id: 'east-2', x: 290, y: 50, width: 80, height: 100 },
    { id: 'east-3', x: 380, y: 50, width: 80, height: 100 },
    { id: 'east-4', x: 200, y: 160, width: 80, height: 100 },
    { id: 'east-5', x: 290, y: 160, width: 80, height: 100 },
    { id: 'east-6', x: 380, y: 160, width: 80, height: 100 },
  ],
  west: [
    { id: 'west-1', x: 20, y: 50, width: 70, height: 80 },
    { id: 'west-2', x: 100, y: 50, width: 70, height: 80 },
    { id: 'west-3', x: 20, y: 140, width: 70, height: 70 },
    { id: 'west-4', x: 100, y: 140, width: 70, height: 70 },
  ],
  south: [
    { id: 'south-1', x: 200, y: 300, width: 80, height: 90 },
    { id: 'south-2', x: 290, y: 300, width: 80, height: 90 },
    { id: 'south-3', x: 200, y: 400, width: 80, height: 90 },
    { id: 'south-4', x: 290, y: 400, width: 80, height: 90 },
  ],
}

// 選択中のエリア
const selectedArea = ref<string | null>(null)

const selectArea = (areaId: string) => {
  selectedArea.value = selectedArea.value === areaId ? null : areaId
}

const selectedStatus = computed(() => {
  if (!selectedArea.value) return null
  return getAreaStatus(selectedArea.value)
})
</script>

<template>
  <div class="heatmap-container">
    <svg 
      viewBox="0 0 500 520" 
      class="heatmap-svg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- 背景 -->
      <rect x="0" y="0" width="500" height="520" fill="var(--bg-secondary)" rx="8" />
      
      <!-- 西ホールラベル -->
      <text x="90" y="30" class="hall-label">西ホール</text>
      
      <!-- 西ホール -->
      <g v-for="hall in halls.west" :key="hall.id">
        <rect
          :x="hall.x"
          :y="hall.y"
          :width="hall.width"
          :height="hall.height"
          :fill="getAreaColor(hall.id)"
          :fill-opacity="getAreaOpacity(hall.id)"
          :stroke="selectedArea === hall.id ? '#fff' : 'var(--border-color)'"
          :stroke-width="selectedArea === hall.id ? 2 : 1"
          rx="4"
          class="hall-rect"
          @click="selectArea(hall.id)"
        />
        <text
          :x="hall.x + hall.width / 2"
          :y="hall.y + hall.height / 2"
          class="hall-text"
        >
          {{ hall.id.replace('west-', '西') }}
        </text>
      </g>

      <!-- 東ホールラベル -->
      <text x="330" y="30" class="hall-label">東ホール</text>

      <!-- 東ホール -->
      <g v-for="hall in halls.east" :key="hall.id">
        <rect
          :x="hall.x"
          :y="hall.y"
          :width="hall.width"
          :height="hall.height"
          :fill="getAreaColor(hall.id)"
          :fill-opacity="getAreaOpacity(hall.id)"
          :stroke="selectedArea === hall.id ? '#fff' : 'var(--border-color)'"
          :stroke-width="selectedArea === hall.id ? 2 : 1"
          rx="4"
          class="hall-rect"
          @click="selectArea(hall.id)"
        />
        <text
          :x="hall.x + hall.width / 2"
          :y="hall.y + hall.height / 2"
          class="hall-text"
        >
          {{ hall.id.replace('east-', '東') }}
        </text>
      </g>

      <!-- 南ホールラベル -->
      <text x="280" y="285" class="hall-label">南ホール</text>

      <!-- 南ホール -->
      <g v-for="hall in halls.south" :key="hall.id">
        <rect
          :x="hall.x"
          :y="hall.y"
          :width="hall.width"
          :height="hall.height"
          :fill="getAreaColor(hall.id)"
          :fill-opacity="getAreaOpacity(hall.id)"
          :stroke="selectedArea === hall.id ? '#fff' : 'var(--border-color)'"
          :stroke-width="selectedArea === hall.id ? 2 : 1"
          rx="4"
          class="hall-rect"
          @click="selectArea(hall.id)"
        />
        <text
          :x="hall.x + hall.width / 2"
          :y="hall.y + hall.height / 2"
          class="hall-text"
        >
          {{ hall.id.replace('south-', '南') }}
        </text>
      </g>

      <!-- 凡例 -->
      <g transform="translate(400, 400)">
        <text x="0" y="0" class="legend-title">混雑度</text>
        <rect x="0" y="10" width="20" height="12" :fill="densityColors.low" rx="2" />
        <text x="25" y="20" class="legend-text">快適</text>
        <rect x="0" y="28" width="20" height="12" :fill="densityColors.moderate" rx="2" />
        <text x="25" y="38" class="legend-text">混雑</text>
        <rect x="0" y="46" width="20" height="12" :fill="densityColors.high" rx="2" />
        <text x="25" y="56" class="legend-text">危険</text>
        <rect x="0" y="64" width="20" height="12" :fill="densityColors.critical" rx="2" />
        <text x="25" y="74" class="legend-text">非常に危険</text>
      </g>
    </svg>

    <!-- 選択中エリアの詳細 -->
    <Transition name="slide">
      <div v-if="selectedStatus" class="selected-detail">
        <div class="detail-header">
          <h4>{{ selectedStatus.areaName }}</h4>
          <button class="close-btn" @click="selectedArea = null">×</button>
        </div>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="label">混雑度</span>
            <span class="value">{{ Math.round(selectedStatus.density * 100) }}%</span>
          </div>
          <div class="detail-item">
            <span class="label">現在人数</span>
            <span class="value">{{ selectedStatus.currentCount.toLocaleString() }}人</span>
          </div>
          <div class="detail-item">
            <span class="label">滞留率</span>
            <span class="value">{{ Math.round(selectedStatus.stagnationRate * 100) }}%</span>
          </div>
          <div class="detail-item">
            <span class="label">収容人数</span>
            <span class="value">{{ selectedStatus.capacity.toLocaleString() }}人</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.heatmap-container {
  position: relative;
}

.heatmap-svg {
  width: 100%;
  max-width: 600px;
  height: auto;
  margin: 0 auto;
  display: block;
}

.hall-rect {
  cursor: pointer;
  transition: all 0.2s ease;
}

.hall-rect:hover {
  filter: brightness(1.2);
}

.hall-text {
  fill: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
}

.hall-label {
  fill: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  text-anchor: middle;
}

.legend-title {
  fill: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
}

.legend-text {
  fill: var(--text-muted);
  font-size: 9px;
}

.selected-detail {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.detail-header h4 {
  font-size: 1rem;
  font-weight: 700;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-item .label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.detail-item .value {
  font-size: 1rem;
  font-weight: 700;
  font-family: var(--font-mono);
}

/* トランジション */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
