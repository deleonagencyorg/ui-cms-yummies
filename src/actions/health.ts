import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { MultimediaResponse } from '@/actions/multimedia'
import type { Pagination } from './departments'

export interface HealthSlide {
  id: string
  desktop: MultimediaResponse | null
  mobile: MultimediaResponse | null
  alt: string
  title: string
  description: string
  link: string
  order: number
}

export interface HealthVideo {
  id: string
  title: string
  order: number
  video: MultimediaResponse | null
  thumbnail: MultimediaResponse | null
  createdAt: string
  updatedAt: string
}

export interface HealthConfig {
  id: string
  siteId: string
  languageCode: string
  title: string
  description: string
  image: MultimediaResponse | null
  slider: HealthSlide[]
  videosSectionTitle: string
  videosSectionDescription: string
  videos: HealthVideo[]
  createdAt: string
  updatedAt: string
}

export interface HealthListResponse {
  data: HealthConfig[]
  pagination: Pagination
}

export interface CreateHealthSlideRequest {
  desktopImageId?: string | null
  mobileImageId?: string | null
  alt?: string
  title?: string
  description?: string
  link?: string
  order?: number
}

export interface CreateHealthVideoRequest {
  title: string
  videoId?: string | null
  thumbnailId?: string | null
  order?: number
}

export interface CreateHealthConfigRequest {
  siteId: string
  languageCode: string
  title?: string
  description?: string
  imageId?: string | null
  slider?: CreateHealthSlideRequest[]
  videosSectionTitle?: string
  videosSectionDescription?: string
  videos?: CreateHealthVideoRequest[]
}

export interface UpdateHealthConfigRequest {
  siteId?: string
  languageCode?: string
  title?: string
  description?: string
  imageId?: string | null
  slider?: CreateHealthSlideRequest[]
  videosSectionTitle?: string
  videosSectionDescription?: string
  videos?: CreateHealthVideoRequest[]
}

export interface HealthFiltersRequest {
  title?: string
  languageCode?: string
  siteId?: string
  page?: number
  pageSize?: number
}

export const healthActions = {
  getAll: async (filters?: HealthFiltersRequest) => {
    const response = await axiosInstance.get<HealthListResponse>(
      API_ENDPOINTS.HEALTH.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<HealthConfig>(
      API_ENDPOINTS.HEALTH.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateHealthConfigRequest) => {
    const response = await axiosInstance.post<HealthConfig>(
      API_ENDPOINTS.HEALTH.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateHealthConfigRequest) => {
    const response = await axiosInstance.put<HealthConfig>(
      API_ENDPOINTS.HEALTH.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.HEALTH.BY_ID(id))
  },
}
