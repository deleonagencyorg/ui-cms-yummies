import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface SiteText {
  id: string
  siteId: string
  languageCode: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

export interface SiteTextListResponse {
  data: SiteText[]
  pagination: Pagination
}

export interface CreateSiteTextRequest {
  siteId: string
  languageCode: string
  key: string
  value?: string
}

export type UpdateSiteTextRequest = Partial<CreateSiteTextRequest>

export interface SiteTextFiltersRequest {
  siteId?: string
  languageCode?: string
  key?: string
  page?: number
  pageSize?: number
}

export const siteTextActions = {
  getAll: async (filters?: SiteTextFiltersRequest) => {
    const response = await axiosInstance.get<SiteTextListResponse>(
      API_ENDPOINTS.SITE_TEXTS.BASE,
      { params: filters }
    )
    return response.data
  },

  getByLanguage: async (languageCode: string) => {
    const response = await axiosInstance.get<SiteText>(
      API_ENDPOINTS.SITE_TEXTS.BY_LANGUAGE(languageCode)
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<SiteText>(
      API_ENDPOINTS.SITE_TEXTS.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateSiteTextRequest) => {
    const response = await axiosInstance.post<SiteText>(
      API_ENDPOINTS.SITE_TEXTS.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateSiteTextRequest) => {
    const response = await axiosInstance.put<SiteText>(
      API_ENDPOINTS.SITE_TEXTS.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.SITE_TEXTS.BY_ID(id))
  },
}
