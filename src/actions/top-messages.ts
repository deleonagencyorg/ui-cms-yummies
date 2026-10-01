import axiosInstance from '@/lib/axios'

export interface TopMessageResponse {
  id: string
  title: string
  link?: string
  order?: number
  languageCode: string
  brandId: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateTopMessageRequest {
  title: string
  link?: string
  order?: number
  languageCode: string
  brandId: string
}

export interface UpdateTopMessageRequest {
  title: string
  link?: string
  order?: number
  languageCode: string
  brandId: string
}

export interface TopMessageFiltersRequest {
  brandId?: string
  languageCode?: string
}

export interface TopMessageListResponse {
  data: TopMessageResponse[]
}

export const topMessageActions = {
  getAll: async (filters?: TopMessageFiltersRequest) => {
    const response = await axiosInstance.get<TopMessageListResponse>('/top-messages', {
      params: filters,
    })
    return response.data?.data || []
  },

  create: async (data: CreateTopMessageRequest) => {
    const response = await axiosInstance.post<TopMessageResponse>('/top-messages', data)
    return response.data
  },

  update: async (id: string, data: UpdateTopMessageRequest) => {
    const response = await axiosInstance.put<TopMessageResponse>(`/top-messages/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/top-messages/${id}`)
  },
}