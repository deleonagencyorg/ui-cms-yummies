import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface SiteResponse {
  id: string
  name: string
  domain: string
  slug: string
  defaultLanguageCode: string
  status: 'active' | 'inactive' | 'maintenance'
  defaultMetaTitle?: string
  defaultMetaDescription?: string
  faviconUrl?: string
  logoUrl?: string
  googleAnalyticsId?: string
  googleTagManagerId?: string
  facebookPixelId?: string
  robotsTxt?: string
  sitemapEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface SiteListResponse {
  data: SiteResponse[]
  pagination: Pagination
}

export interface CreateSiteRequest {
  name: string
  domain: string
  slug: string
  defaultLanguageCode?: string
  status?: 'active' | 'inactive' | 'maintenance'
  defaultMetaTitle?: string
  defaultMetaDescription?: string
  faviconUrl?: string
  logoUrl?: string
  googleAnalyticsId?: string
  googleTagManagerId?: string
  facebookPixelId?: string
  robotsTxt?: string
  sitemapEnabled?: boolean
}

export interface UpdateSiteRequest {
  name?: string
  domain?: string
  slug?: string
  defaultLanguageCode?: string
  status?: 'active' | 'inactive' | 'maintenance'
  defaultMetaTitle?: string
  defaultMetaDescription?: string
  faviconUrl?: string
  logoUrl?: string
  googleAnalyticsId?: string
  googleTagManagerId?: string
  facebookPixelId?: string
  robotsTxt?: string
  sitemapEnabled?: boolean
}

export interface SiteFiltersRequest {
  name?: string
  domain?: string
  slug?: string
  status?: string
  page?: number
  pageSize?: number
}

export const siteActions = {
  getAll: async (filters?: SiteFiltersRequest) => {
    const response = await axiosInstance.get<SiteListResponse>(
      API_ENDPOINTS.SITES.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<SiteResponse>(
      API_ENDPOINTS.SITES.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateSiteRequest) => {
    const response = await axiosInstance.post<SiteResponse>(
      API_ENDPOINTS.SITES.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateSiteRequest) => {
    const response = await axiosInstance.put<SiteResponse>(
      API_ENDPOINTS.SITES.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.SITES.BY_ID(id))
  },
}
