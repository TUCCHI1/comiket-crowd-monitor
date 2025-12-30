import type { CrowdData, AreaStatus, StagnationAlert } from '~/types'

export const useCrowdData = (pollInterval: number = 3000) => {
  const crowdData = useState<CrowdData | null>('crowdData', () => null)
  const isLoading = useState('crowdLoading', () => false)
  const error = useState<string | null>('crowdError', () => null)

  let intervalId: ReturnType<typeof setInterval> | null = null

  const fetchCrowdData = async () => {
    try {
      const data = await $fetch<CrowdData>('/api/crowd-status')
      crowdData.value = data
      error.value = null
    } catch (e) {
      console.error('Failed to fetch crowd data:', e)
      error.value = '混雑データの取得に失敗しました'
    }
  }

  const startPolling = () => {
    // 初回取得
    isLoading.value = true
    fetchCrowdData().finally(() => {
      isLoading.value = false
    })

    // ポーリング開始
    intervalId = setInterval(fetchCrowdData, pollInterval)
  }

  const stopPolling = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // エリアをホール別にグループ化
  const areasByHall = computed(() => {
    if (!crowdData.value) return { east: [], west: [], south: [] }

    const grouped: Record<'east' | 'west' | 'south', AreaStatus[]> = {
      east: [],
      west: [],
      south: [],
    }

    for (const area of crowdData.value.areas) {
      if (grouped[area.hall]) {
        grouped[area.hall].push(area)
      }
    }

    return grouped
  })

  // 危険なエリア（密度が高い順）
  const criticalAreas = computed(() => {
    if (!crowdData.value) return []
    return crowdData.value.areas
      .filter((a) => a.density > 0.7)
      .sort((a, b) => b.density - a.density)
  })

  // アクティブなアラート
  const activeAlerts = computed((): StagnationAlert[] => {
    return crowdData.value?.alerts || []
  })

  // コンポーネントアンマウント時にクリーンアップ
  onUnmounted(() => {
    stopPolling()
  })

  return {
    crowdData: readonly(crowdData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    areasByHall,
    criticalAreas,
    activeAlerts,
    startPolling,
    stopPolling,
    refresh: fetchCrowdData,
  }
}
