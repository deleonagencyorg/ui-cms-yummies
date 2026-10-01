import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface ModalConfig {
  id: string
  siteId: string
  languageCode: string
  slug: string
  triggerLabel: string
  closeLabel: string
  imageId: string | null
  imageAlt: string
  title: string
  paragraphs: string[]
  createdAt: string
  updatedAt: string
}

export interface ModalListResponse {
  data: ModalConfig[]
  pagination: Pagination
}

export interface CreateModalRequest {
  siteId: string
  languageCode: string
  slug: string
  triggerLabel?: string
  closeLabel?: string
  imageId?: string | null
  imageAlt?: string
  title?: string
  paragraphs?: string[]
}

export type UpdateModalRequest = Partial<CreateModalRequest>

export interface ModalFiltersRequest {
  siteId?: string
  languageCode?: string
  slug?: string
  page?: number
  pageSize?: number
}

export const modalActions = {
  getAll: async (filters?: ModalFiltersRequest) => {
    const response = await axiosInstance.get<ModalListResponse>(
      API_ENDPOINTS.MODALS.BASE,
      { params: filters }
    )
    return response.data
  },

  getByLanguage: async (languageCode: string) => {
    const response = await axiosInstance.get<ModalConfig>(
      API_ENDPOINTS.MODALS.BY_LANGUAGE(languageCode)
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ModalConfig>(
      API_ENDPOINTS.MODALS.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateModalRequest) => {
    const response = await axiosInstance.post<ModalConfig>(
      API_ENDPOINTS.MODALS.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateModalRequest) => {
    const response = await axiosInstance.put<ModalConfig>(
      API_ENDPOINTS.MODALS.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.MODALS.BY_ID(id))
  },
}
