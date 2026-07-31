import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { MultimediaResponse } from '@/actions/multimedia'

export interface HealthVideo {
  id: string
  healthConfigId: string
  title: string
  description: string
  order: number
  videoId: string | null
  video: MultimediaResponse | null
  createdAt: string
  updatedAt: string
}

export interface HealthConfig {
  id: string
  heroImageId: string | null
  heroImage: MultimediaResponse | null
  mainTitle: string
  mainDescription: string
  mainImageId: string | null
  mainImage: MultimediaResponse | null
  videosSectionTitle: string
  videosSectionDescription: string
  videos: HealthVideo[]
  createdAt: string
  updatedAt: string
}

export interface CreateHealthVideoRequest {
  title: string
  description?: string
  videoId?: string | null
  order?: number
}

export interface UpdateHealthConfigRequest {
  heroImageId?: string | null
  mainTitle?: string
  mainDescription?: string
  mainImageId?: string | null
  videosSectionTitle?: string
  videosSectionDescription?: string
  videos?: CreateHealthVideoRequest[]
}

export const healthActions = {
  getConfig: async () => {
    const response = await axiosInstance.get<HealthConfig>(API_ENDPOINTS.HEALTH.CONFIG)
    return response.data
  },

  updateConfig: async (data: UpdateHealthConfigRequest) => {
    const response = await axiosInstance.put<HealthConfig>(API_ENDPOINTS.HEALTH.CONFIG, data)
    return response.data
  },
}
