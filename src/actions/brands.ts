import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface BrandLanguageResponse {
  id: string
  name: string
  link: string
  logoUrl: string
  caption: string
  brandId: string
  code: string
  createdAt: string
}

export interface BrandResponse {
  id: string
  name: string
  slug: string
  logoUrl: string
  background: string
  brandLanguages: BrandLanguageResponse[]
  createdAt: string
}

export interface BrandListResponse {
  data: BrandResponse[]
  pagination: Pagination
}

export interface BrandLanguageRequest {
  id?: string
  name: string
  link?: string
  logoUrl?: string
  caption?: string
  code: string
}

export interface CreateBrandRequest {
  name: string
  slug: string
  logoUrl?: string
  background?: string
  brandLanguages?: BrandLanguageRequest[]
}

export interface UpdateBrandRequest {
  name?: string
  slug?: string
  logoUrl?: string
  background?: string
  brandLanguages?: BrandLanguageRequest[]
}

export interface BrandFiltersRequest {
  name?: string
  slug?: string
  page?: number
  pageSize?: number
}

export const brandActions = {
  getAll: async (filters?: BrandFiltersRequest) => {
    const response = await axiosInstance.get<BrandListResponse>(
      API_ENDPOINTS.BRANDS.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<BrandResponse>(
      API_ENDPOINTS.BRANDS.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateBrandRequest) => {
    const response = await axiosInstance.post<BrandResponse>(
      API_ENDPOINTS.BRANDS.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateBrandRequest) => {
    const response = await axiosInstance.put<BrandResponse>(
      API_ENDPOINTS.BRANDS.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.BRANDS.BY_ID(id))
  },
}
