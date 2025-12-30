<script setup lang="ts">
import type { DensityLevel } from '~/types'

interface Props {
  level: DensityLevel
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLabel: true,
})

const labels: Record<DensityLevel, string> = {
  low: '快適',
  moderate: '混雑',
  high: '危険',
  critical: '危険',
}

const badgeClass = computed(() => {
  const classes: Record<DensityLevel, string> = {
    low: 'badge-safe',
    moderate: 'badge-warning',
    high: 'badge-danger',
    critical: 'badge-critical',
  }
  return classes[props.level]
})
</script>

<template>
  <span class="badge" :class="badgeClass">
    {{ showLabel ? labels[level] : '' }}
    <slot />
  </span>
</template>
