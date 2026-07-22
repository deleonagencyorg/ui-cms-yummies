import axiosInstance from '@/lib/axios'

export interface TopMessageResponse {
  id: number
  text: string
  sort_order: number
  brand_id: number
  language_id: number
  created_at: string
  updated_at: string
}

export interface CreateTopMessageRequest {
  text: string
  sort_order: number
  brand_id: number
  language_id: number
}

export interface UpdateTopMessageRequest {
  text?: string
  sort_order?: number
  brand_id?: number
  language_id?: number
}

export const topMessageActions = {
  getAll: async () => {
    const response = await axiosInstance.get<TopMessageResponse[]>('/top-messages')
    return response.data
  },

  create: async (data: CreateTopMessageRequest) => {
    const response = await axiosInstance.post<TopMessageResponse>('/top-messages', data)
    return response.data
  },

  delete: async (id: number | string) => {
    await axiosInstance.delete(`/top-messages/${id}`)
  },
}