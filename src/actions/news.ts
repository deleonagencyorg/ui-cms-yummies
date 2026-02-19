import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface NewsBrandResponse {
  id: string
  name: string
  slug: string
}

export interface NewsResponse {
  id: string
  title: string
  slug: string
  subtitle: string
  image: string
  imageMobile: string
  gallery: string[]
  content: string
  excerpt: string
  category: string
  tags: string[]
  author: string
  publishedAt: string | null
  isPublished: boolean
  isFeatured: boolean
  languageCode: string
  brands: NewsBrandResponse[]
  createdAt: string
}

export interface NewsListResponse {
  data: NewsResponse[]
  pagination: Pagination
}

export interface CreateNewsRequest {
  title: string
  slug: string
  subtitle?: string
  image?: string
  imageMobile?: string
  gallery?: string[]
  content?: string
  excerpt?: string
  category?: string
  tags?: string[]
  author?: string
  publishedAt?: string
  isPublished?: boolean
  isFeatured?: boolean
  languageCode: string
  brandIds?: string[]
}

export interface UpdateNewsRequest {
  title?: string
  slug?: string
  subtitle?: string
  image?: string
  imageMobile?: string
  gallery?: string[]
  content?: string
  excerpt?: string
  category?: string
  tags?: string[]
  author?: string
  publishedAt?: string
  isPublished?: boolean
  isFeatured?: boolean
  languageCode?: string
  brandIds?: string[]
}

export interface NewsFiltersRequest {
  title?: string
  slug?: string
  category?: string
  author?: string
  isPublished?: boolean
  isFeatured?: boolean
  languageCode?: string
  brandId?: string
  page?: number
  pageSize?: number
}

export const newsActions = {
  getAll: async (filters?: NewsFiltersRequest) => {
    const response = await axiosInstance.get<NewsListResponse>(
      API_ENDPOINTS.NEWS.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<NewsResponse>(
      API_ENDPOINTS.NEWS.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateNewsRequest) => {
    const response = await axiosInstance.post<NewsResponse>(
      API_ENDPOINTS.NEWS.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateNewsRequest) => {
    const response = await axiosInstance.put<NewsResponse>(
      API_ENDPOINTS.NEWS.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.NEWS.BY_ID(id))
  },
}
