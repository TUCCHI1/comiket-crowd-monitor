<script setup lang="ts">
import type { StagnationAlert } from '~/types'

interface Props {
  alert: StagnationAlert
}

const props = defineProps<Props>()

const alertClass = computed(() => `alert-${props.alert.severity}`)

const severityIcon = computed(() => {
  const icons: Record<string, string> = {
    warning: '⚠️',
    danger: '🚨',
    critical: '🔴',
  }
  return icons[props.alert.severity]
})

const timeAgo = computed(() => {
  const diff = Date.now() - props.alert.timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  return `${hours}時間前`
})
</script>

<template>
  <div class="alert" :class="alertClass">
    <span class="alert-icon">{{ severityIcon }}</span>
    <div class="alert-content">
      <div class="alert-header">
        <span class="alert-area">{{ alert.areaName }}</span>
        <span class="alert-time">{{ timeAgo }}</span>
      </div>
      <p class="alert-message">{{ alert.message }}</p>
      <div class="alert-meta">
        <span class="alert-duration">継続時間: {{ alert.duration }}分以上</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  border-left: 4px solid;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: var(--status-warning);
}

.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--status-danger);
}

.alert-critical {
  background: rgba(220, 38, 38, 0.15);
  border-color: var(--status-critical);
  animation: alert-glow 2s infinite;
}

@keyframes alert-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
  50% { box-shadow: 0 0 20px 0 rgba(220, 38, 38, 0.3); }
}

.alert-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
}

.alert-area {
  font-weight: 700;
  font-size: 0.95rem;
}

.alert-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.alert-message {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}

.alert-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
</style>
