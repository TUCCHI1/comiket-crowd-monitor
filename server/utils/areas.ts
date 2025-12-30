import type { AreaBounds, AreaStatus, StagnationAlert, LocationData } from '~/types'

// 東京ビッグサイトの会場エリア定義
// 実際の座標は概算値（本番では正確な測量が必要）
export const BIGSIGHT_AREAS: AreaBounds[] = [
  // 東ホール
  { id: 'east-1', name: '東1ホール', hall: 'east', minLat: 35.6295, maxLat: 35.6305, minLng: 139.7940, maxLng: 139.7955, capacity: 3000 },
  { id: 'east-2', name: '東2ホール', hall: 'east', minLat: 35.6295, maxLat: 35.6305, minLng: 139.7955, maxLng: 139.7970, capacity: 3000 },
  { id: 'east-3', name: '東3ホール', hall: 'east', minLat: 35.6295, maxLat: 35.6305, minLng: 139.7970, maxLng: 139.7985, capacity: 3000 },
  { id: 'east-4', name: '東4ホール', hall: 'east', minLat: 35.6280, maxLat: 35.6290, minLng: 139.7940, maxLng: 139.7955, capacity: 3000 },
  { id: 'east-5', name: '東5ホール', hall: 'east', minLat: 35.6280, maxLat: 35.6290, minLng: 139.7955, maxLng: 139.7970, capacity: 3000 },
  { id: 'east-6', name: '東6ホール', hall: 'east', minLat: 35.6280, maxLat: 35.6290, minLng: 139.7970, maxLng: 139.7985, capacity: 3000 },
  
  // 西ホール
  { id: 'west-1', name: '西1ホール', hall: 'west', minLat: 35.6310, maxLat: 35.6320, minLng: 139.7920, maxLng: 139.7935, capacity: 2500 },
  { id: 'west-2', name: '西2ホール', hall: 'west', minLat: 35.6310, maxLat: 35.6320, minLng: 139.7935, maxLng: 139.7950, capacity: 2500 },
  { id: 'west-3', name: '西3ホール', hall: 'west', minLat: 35.6320, maxLat: 35.6330, minLng: 139.7920, maxLng: 139.7935, capacity: 2000 },
  { id: 'west-4', name: '西4ホール', hall: 'west', minLat: 35.6320, maxLat: 35.6330, minLng: 139.7935, maxLng: 139.7950, capacity: 2000 },

  // 南ホール
  { id: 'south-1', name: '南1ホール', hall: 'south', minLat: 35.6265, maxLat: 35.6275, minLng: 139.7945, maxLng: 139.7960, capacity: 3500 },
  { id: 'south-2', name: '南2ホール', hall: 'south', minLat: 35.6265, maxLat: 35.6275, minLng: 139.7960, maxLng: 139.7975, capacity: 3500 },
  { id: 'south-3', name: '南3ホール', hall: 'south', minLat: 35.6255, maxLat: 35.6265, minLng: 139.7945, maxLng: 139.7960, capacity: 3500 },
  { id: 'south-4', name: '南4ホール', hall: 'south', minLat: 35.6255, maxLat: 35.6265, minLng: 139.7960, maxLng: 139.7975, capacity: 3500 },

  // 共用エリア
  { id: 'entrance-east', name: '東エントランス', hall: 'east', minLat: 35.6302, maxLat: 35.6310, minLng: 139.7955, maxLng: 139.7975, capacity: 2000 },
  { id: 'passage-ew', name: '東西連絡通路', hall: 'east', minLat: 35.6305, maxLat: 35.6315, minLng: 139.7940, maxLng: 139.7955, capacity: 1500 },
]

// 座標からエリアを検出
export const detectArea = (lat: number, lng: number): AreaBounds | null => {
  for (const area of BIGSIGHT_AREAS) {
    if (
      lat >= area.minLat &&
      lat <= area.maxLat &&
      lng >= area.minLng &&
      lng <= area.maxLng
    ) {
      return area
    }
  }
  return null
}

// インメモリのユーザー位置データストア（本番ではRedis等を使用）
interface UserLocation {
  oderId: string
  areaId: string
  enteredAt: number
  lastUpdated: number
}

const userLocations = new Map<string, UserLocation>()
const areaHistories = new Map<string, number[]>() // エリアごとの過去の人数履歴

// 位置情報を更新
export const updateUserLocation = (data: LocationData): string | null => {
  const area = detectArea(data.latitude, data.longitude)
  
  if (!area) {
    // エリア外の場合、ユーザーをマップから削除
    userLocations.delete(data.oderId)
    return null
  }

  const existing = userLocations.get(data.oderId)
  
  if (existing && existing.areaId === area.id) {
    // 同じエリアにいる場合は更新時刻のみ更新
    existing.lastUpdated = data.timestamp
  } else {
    // 新規または別エリアへ移動
    userLocations.set(data.oderId, {
      oderId: data.oderId,
      areaId: area.id,
      enteredAt: data.timestamp,
      lastUpdated: data.timestamp,
    })
  }

  return area.id
}

// エリアごとの混雑状況を計算
export const calculateAreaStatus = (stagnationThresholdMinutes: number = 5): AreaStatus[] => {
  const now = Date.now()
  const stagnationThreshold = stagnationThresholdMinutes * 60 * 1000

  // 古いデータをクリーンアップ（2分以上更新がないユーザーを削除）
  const cleanupThreshold = 2 * 60 * 1000
  for (const [oderId, location] of userLocations.entries()) {
    if (now - location.lastUpdated > cleanupThreshold) {
      userLocations.delete(oderId)
    }
  }

  return BIGSIGHT_AREAS.map((area) => {
    // このエリアにいるユーザーをフィルタ
    const usersInArea = Array.from(userLocations.values()).filter(
      (u) => u.areaId === area.id
    )

    const currentCount = usersInArea.length
    const density = currentCount / area.capacity

    // 滞留率を計算（閾値以上の時間いるユーザーの割合）
    const stagnantUsers = usersInArea.filter(
      (u) => now - u.enteredAt > stagnationThreshold
    )
    const stagnationRate = usersInArea.length > 0
      ? stagnantUsers.length / usersInArea.length
      : 0

    // 履歴を更新してトレンドを計算
    const history = areaHistories.get(area.id) || []
    history.push(currentCount)
    if (history.length > 10) history.shift()
    areaHistories.set(area.id, history)

    let trend: 'increasing' | 'stable' | 'decreasing' = 'stable'
    if (history.length >= 3) {
      const recent = history.slice(-3)
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length
      const first = recent[0]
      if (avg > first * 1.1) trend = 'increasing'
      else if (avg < first * 0.9) trend = 'decreasing'
    }

    // 流入出比率（簡易計算）
    const flowRate = stagnationRate > 0.5 ? 1 - stagnationRate : 1

    return {
      areaId: area.id,
      areaName: area.name,
      hall: area.hall,
      currentCount,
      capacity: area.capacity,
      density,
      stagnationRate,
      flowRate,
      trend,
      lastUpdated: now,
    }
  })
}

// 滞留アラートを生成
export const generateAlerts = (statuses: AreaStatus[]): StagnationAlert[] => {
  const alerts: StagnationAlert[] = []

  for (const status of statuses) {
    // 高密度 + 高滞留率の場合にアラート
    if (status.density > 0.8 && status.stagnationRate > 0.5) {
      let severity: StagnationAlert['severity'] = 'warning'
      if (status.density > 0.9 && status.stagnationRate > 0.7) {
        severity = 'critical'
      } else if (status.density > 0.85 || status.stagnationRate > 0.6) {
        severity = 'danger'
      }

      alerts.push({
        id: `alert-${status.areaId}-${Date.now()}`,
        areaId: status.areaId,
        areaName: status.areaName,
        severity,
        message: `${status.areaName}で滞留が発生しています（密度: ${Math.round(status.density * 100)}%, 滞留率: ${Math.round(status.stagnationRate * 100)}%）`,
        duration: Math.round(status.stagnationRate * 10), // 概算
        timestamp: Date.now(),
      })
    }
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, danger: 1, warning: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

// 全体の来場者数を取得
export const getTotalVisitors = (): number => {
  return userLocations.size
}

// デモ用のダミーデータを生成
export const generateDemoData = () => {
  const now = Date.now()
  
  // 各エリアにランダムなユーザーを配置
  BIGSIGHT_AREAS.forEach((area, index) => {
    // エリアごとに異なる混雑度を設定
    const baseCount = Math.floor(area.capacity * (0.3 + Math.random() * 0.6))
    
    for (let i = 0; i < baseCount; i++) {
      const oderId = `demo-${area.id}-${i}`
      const enteredAt = now - Math.random() * 30 * 60 * 1000 // 0-30分前
      
      userLocations.set(oderId, {
        oderId,
        areaId: area.id,
        enteredAt,
        lastUpdated: now - Math.random() * 60 * 1000, // 0-1分前
      })
    }
  })
}

// 初回起動時にデモデータを生成
generateDemoData()
