import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface InstagramPost {
  id: string
  descubrenosId: string
  postUrl: string
  embedUrl: string
  imageUrl: string
  fallbackImage: string
  alt: string
  position: number
  createdAt: string
  updatedAt: string
}

export interface Descubrenos {
  id: string
  siteId: string
  title: string
  languageCode: string
  showOnHome: boolean
  showOnProducts: boolean
  showOnHealth: boolean
  posts: InstagramPost[]
  createdAt: string
  updatedAt: string
}

export interface DescubrenosListResponse {
  data: Descubrenos[]
  pagination: Pagination
}

export interface CreateInstagramPostRequest {
  postUrl?: string
  embedUrl?: string
  imageUrl?: string
  fallbackImage?: string
  alt?: string
  position?: number
}

export interface CreateDescubrenosRequest {
  siteId: string
  title: string
  languageCode: string
  showOnHome?: boolean
  showOnProducts?: boolean
  showOnHealth?: boolean
  posts: CreateInstagramPostRequest[]
}

export interface UpdateDescubrenosRequest {
  siteId?: string
  title?: string
  languageCode?: string
  showOnHome?: boolean
  showOnProducts?: boolean
  showOnHealth?: boolean
  posts?: CreateInstagramPostRequest[]
}

export interface DescubrenosFiltersRequest {
  title?: string
  languageCode?: string
  siteId?: string
  showOnHome?: boolean
  showOnProducts?: boolean
  showOnHealth?: boolean
  page?: number
  pageSize?: number
}

export const descubrenosActions = {
  getAll: async (filters?: DescubrenosFiltersRequest) => {
    const response = await axiosInstance.get<DescubrenosListResponse>(
      API_ENDPOINTS.DESCUBRENOS.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<Descubrenos>(
      API_ENDPOINTS.DESCUBRENOS.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateDescubrenosRequest) => {
    const response = await axiosInstance.post<Descubrenos>(
      API_ENDPOINTS.DESCUBRENOS.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateDescubrenosRequest) => {
    const response = await axiosInstance.put<Descubrenos>(
      API_ENDPOINTS.DESCUBRENOS.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.DESCUBRENOS.BY_ID(id))
  },
}
