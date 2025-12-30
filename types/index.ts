// ビッグサイト会場のエリア定義
export interface AreaBounds {
  id: string
  name: string
  hall: 'east' | 'west' | 'south'
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
  capacity: number // 最大収容人数
}

// ユーザーの位置情報
export interface LocationData {
  oderId: string // 匿名化されたユーザーID
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

// エリアごとの混雑状況
export interface AreaStatus {
  areaId: string
  areaName: string
  hall: 'east' | 'west' | 'south'
  currentCount: number
  capacity: number
  density: number // 0-1 (混雑率)
  stagnationRate: number // 0-1 (滞留率)
  flowRate: number // 流入出比率
  trend: 'increasing' | 'stable' | 'decreasing'
  lastUpdated: number
}

// 滞留アラート
export interface StagnationAlert {
  id: string
  areaId: string
  areaName: string
  severity: 'warning' | 'danger' | 'critical'
  message: string
  duration: number // 滞留継続時間（分）
  timestamp: number
}

// 全体の混雑データ
export interface CrowdData {
  areas: AreaStatus[]
  alerts: StagnationAlert[]
  totalVisitors: number
  lastUpdated: number
}

// WebSocketメッセージ
export interface WSMessage {
  type: 'location' | 'crowdUpdate' | 'alert'
  payload: LocationData | CrowdData | StagnationAlert
}

// PWAの位置情報追跡状態
export interface TrackingState {
  isTracking: boolean
  lastSent: number | null
  currentArea: string | null
  error: string | null
}

// 密度レベル
export type DensityLevel = 'low' | 'moderate' | 'high' | 'critical'

// 密度レベル判定
export const getDensityLevel = (density: number): DensityLevel => {
  if (density < 0.5) return 'low'
  if (density < 0.7) return 'moderate'
  if (density < 0.85) return 'high'
  return 'critical'
}

// 密度レベルの色
export const densityColors: Record<DensityLevel, string> = {
  low: '#10b981', // green
  moderate: '#f59e0b', // amber
  high: '#ef4444', // red
  critical: '#dc2626', // dark red
}
