import { calculateAreaStatus, generateAlerts, getTotalVisitors } from '~/server/utils/areas'
import type { CrowdData } from '~/types'

export default defineEventHandler((event): CrowdData => {
  const config = useRuntimeConfig()
  const stagnationThreshold = config.public.stagnationThreshold as number || 5

  const areas = calculateAreaStatus(stagnationThreshold)
  const alerts = generateAlerts(areas)
  const totalVisitors = getTotalVisitors()

  return {
    areas,
    alerts,
    totalVisitors,
    lastUpdated: Date.now(),
  }
})
