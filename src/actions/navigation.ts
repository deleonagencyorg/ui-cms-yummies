import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface MenuItem {
  id: string
  navigationConfigId: string
  label: string
  href: string
  order: number
  parentId: string | null
  isExternal: boolean
}

export interface NavigationConfig {
  id: string
  siteId: string
  languageCode: string
  openMenuLabel: string
  closeMenuLabel: string
  items: MenuItem[]
  createdAt: string
  updatedAt: string
}

export interface NavigationListResponse {
  data: NavigationConfig[]
  pagination: Pagination
}

export interface CreateMenuItemRequest {
  label: string
  href: string
  order: number
  parentId?: string | null
  isExternal?: boolean
}

export interface CreateNavigationConfigRequest {
  siteId: string
  languageCode: string
  openMenuLabel?: string
  closeMenuLabel?: string
  items: CreateMenuItemRequest[]
}

export type UpdateNavigationConfigRequest = Partial<CreateNavigationConfigRequest>

export interface NavigationFiltersRequest {
  siteId?: string
  languageCode?: string
  page?: number
  pageSize?: number
}

export const navigationActions = {
  getAll: async (filters?: NavigationFiltersRequest) => {
    const response = await axiosInstance.get<NavigationListResponse>(
      API_ENDPOINTS.NAVIGATION.BASE,
      { params: filters }
    )
    return response.data
  },

  getByLanguage: async (languageCode: string) => {
    const response = await axiosInstance.get<NavigationConfig>(
      API_ENDPOINTS.NAVIGATION.BY_LANGUAGE(languageCode)
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<NavigationConfig>(
      API_ENDPOINTS.NAVIGATION.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateNavigationConfigRequest) => {
    const response = await axiosInstance.post<NavigationConfig>(
      API_ENDPOINTS.NAVIGATION.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateNavigationConfigRequest) => {
    const response = await axiosInstance.put<NavigationConfig>(
      API_ENDPOINTS.NAVIGATION.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.NAVIGATION.BY_ID(id))
  },
}
