import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface LanguageResponse {
  code: string
  name: string
  nativeName: string
  direction: string
  isActive: boolean
  sortOrder: number
  createdAt: string
}

export interface LanguageListResponse {
  data: LanguageResponse[]
  pagination: Pagination
}

export interface CreateLanguageRequest {
  code: string
  name: string
  nativeName: string
  direction?: string
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateLanguageRequest {
  name?: string
  nativeName?: string
  direction?: string
  isActive?: boolean
  sortOrder?: number
}

export interface LanguageFiltersRequest {
  name?: string
  code?: string
  direction?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}

export const languageActions = {
  getAll: async (filters?: LanguageFiltersRequest) => {
    const response = await axiosInstance.get<LanguageListResponse>(
      API_ENDPOINTS.LANGUAGES.BASE,
      { params: filters }
    )
    return response.data
  },

  getByCode: async (code: string) => {
    const response = await axiosInstance.get<LanguageResponse>(
      API_ENDPOINTS.LANGUAGES.BY_CODE(code)
    )
    return response.data
  },

  create: async (data: CreateLanguageRequest) => {
    const response = await axiosInstance.post<LanguageResponse>(
      API_ENDPOINTS.LANGUAGES.BASE,
      data
    )
    return response.data
  },

  update: async (code: string, data: UpdateLanguageRequest) => {
    const response = await axiosInstance.put<LanguageResponse>(
      API_ENDPOINTS.LANGUAGES.BY_CODE(code),
      data
    )
    return response.data
  },

  delete: async (code: string) => {
    await axiosInstance.delete(API_ENDPOINTS.LANGUAGES.BY_CODE(code))
  },
}
