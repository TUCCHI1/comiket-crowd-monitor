import type { TrackingState, LocationData } from '~/types'

export const useGeolocation = () => {
  const config = useRuntimeConfig()
  const state = useState<TrackingState>('tracking', () => ({
    isTracking: false,
    lastSent: null,
    currentArea: null,
    error: null,
  }))

  const oderId = useState('oderId', () => {
    // ブラウザでのみ実行
    if (import.meta.client) {
      // 既存のIDがあれば使用、なければ生成
      const stored = localStorage.getItem('comiket-oder-id')
      if (stored) return stored
      const newId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      localStorage.setItem('comiket-oder-id', newId)
      return newId
    }
    return ''
  })

  let watchId: number | null = null

  const sendLocation = async (position: GeolocationPosition) => {
    const data: LocationData = {
      oderId: oderId.value,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: Date.now(),
    }

    try {
      const response = await $fetch('/api/location', {
        method: 'POST',
        body: data,
      })

      state.value.lastSent = Date.now()
      state.value.currentArea = response.areaId
      state.value.error = null
    } catch (error) {
      console.error('Failed to send location:', error)
      state.value.error = '位置情報の送信に失敗しました'
    }
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      state.value.error = 'お使いのブラウザは位置情報をサポートしていません'
      return
    }

    state.value.isTracking = true
    state.value.error = null

    // 初回位置取得
    navigator.geolocation.getCurrentPosition(
      sendLocation,
      (error) => {
        state.value.error = getGeolocationError(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )

    // 定期的な位置取得
    watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const now = Date.now()
        const interval = config.public.locationInterval as number || 30000
        
        // インターバル経過後のみ送信
        if (!state.value.lastSent || now - state.value.lastSent >= interval) {
          await sendLocation(position)
        }
      },
      (error) => {
        state.value.error = getGeolocationError(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    )
  }

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    state.value.isTracking = false
  }

  const getGeolocationError = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return '位置情報の許可が拒否されました'
      case error.POSITION_UNAVAILABLE:
        return '位置情報を取得できません'
      case error.TIMEOUT:
        return '位置情報の取得がタイムアウトしました'
      default:
        return '位置情報の取得に失敗しました'
    }
  }

  // コンポーネントアンマウント時にクリーンアップ
  onUnmounted(() => {
    stopTracking()
  })

  return {
    state: readonly(state),
    oderId: readonly(oderId),
    startTracking,
    stopTracking,
  }
}
