import { updateUserLocation } from '~/server/utils/areas'
import type { LocationData } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<LocationData>(event)

  // バリデーション
  if (!body.oderId || !body.latitude || !body.longitude) {
    throw createError({
      statusCode: 400,
      message: 'Invalid location data',
    })
  }

  // 位置情報を更新
  const areaId = updateUserLocation({
    oderId: body.oderId,
    latitude: body.latitude,
    longitude: body.longitude,
    accuracy: body.accuracy || 0,
    timestamp: body.timestamp || Date.now(),
  })

  return {
    success: true,
    areaId,
    timestamp: Date.now(),
  }
})
