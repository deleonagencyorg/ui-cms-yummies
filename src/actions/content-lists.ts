import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface ContentListItem {
  id: string
  contentListId: string
  badge: string
  title: string
  titleHighlight: string
  description: string
  description2: string
  imageId: string | null
  videoId: string | null
  buttonText: string
  buttonUrl: string
  backgroundColor: string
  order: number
}

export interface ContentList {
  id: string
  siteId: string
  languageCode: string
  key: string
  title: string
  description: string
  items: ContentListItem[]
  createdAt: string
  updatedAt: string
}

export interface ContentListListResponse {
  data: ContentList[]
  pagination: Pagination
}

export interface CreateContentListItemRequest {
  badge?: string
  title?: string
  titleHighlight?: string
  description?: string
  description2?: string
  imageId?: string | null
  videoId?: string | null
  buttonText?: string
  buttonUrl?: string
  backgroundColor?: string
  order?: number
}

export interface CreateContentListRequest {
  siteId: string
  languageCode: string
  key: string
  title?: string
  description?: string
  items: CreateContentListItemRequest[]
}

export type UpdateContentListRequest = Partial<CreateContentListRequest>

export interface ContentListFiltersRequest {
  siteId?: string
  languageCode?: string
  key?: string
  page?: number
  pageSize?: number
}

export const contentListActions = {
  getAll: async (filters?: ContentListFiltersRequest) => {
    const response = await axiosInstance.get<ContentListListResponse>(
      API_ENDPOINTS.CONTENT_LISTS.BASE,
      { params: filters }
    )
    return response.data
  },

  getByLanguage: async (languageCode: string) => {
    const response = await axiosInstance.get<ContentList>(
      API_ENDPOINTS.CONTENT_LISTS.BY_LANGUAGE(languageCode)
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ContentList>(
      API_ENDPOINTS.CONTENT_LISTS.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateContentListRequest) => {
    const response = await axiosInstance.post<ContentList>(
      API_ENDPOINTS.CONTENT_LISTS.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateContentListRequest) => {
    const response = await axiosInstance.put<ContentList>(
      API_ENDPOINTS.CONTENT_LISTS.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.CONTENT_LISTS.BY_ID(id))
  },
}
