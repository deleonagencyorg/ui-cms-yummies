import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface SocialMedia {
  id: string
  siteId: string
  languageCode: string
  platform: string
  name: string
  url: string
  alt: string
  iconId: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface SocialMediaListResponse {
  data: SocialMedia[]
  pagination: Pagination
}

export interface CreateSocialMediaRequest {
  siteId: string
  languageCode: string
  platform: string
  name?: string
  url?: string
  alt?: string
  iconId?: string | null
  order?: number
}

export type UpdateSocialMediaRequest = Partial<CreateSocialMediaRequest>

export interface SocialMediaFiltersRequest {
  siteId?: string
  languageCode?: string
  platform?: string
  page?: number
  pageSize?: number
}

export const socialMediaActions = {
  getAll: async (filters?: SocialMediaFiltersRequest) => {
    const response = await axiosInstance.get<SocialMediaListResponse>(
      API_ENDPOINTS.SOCIAL_MEDIA.BASE,
      { params: filters }
    )
    return response.data
  },

  getByLanguage: async (languageCode: string) => {
    const response = await axiosInstance.get<SocialMedia>(
      API_ENDPOINTS.SOCIAL_MEDIA.BY_LANGUAGE(languageCode)
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<SocialMedia>(
      API_ENDPOINTS.SOCIAL_MEDIA.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateSocialMediaRequest) => {
    const response = await axiosInstance.post<SocialMedia>(
      API_ENDPOINTS.SOCIAL_MEDIA.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateSocialMediaRequest) => {
    const response = await axiosInstance.put<SocialMedia>(
      API_ENDPOINTS.SOCIAL_MEDIA.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.SOCIAL_MEDIA.BY_ID(id))
  },
}
