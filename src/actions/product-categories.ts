import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface ProductCategory {
  id: string
  siteId: string
  languageCode: string
  key: string
  label: string
  slug: string
  iconId: string | null
  backgroundColor: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface ProductCategoryListResponse {
  data: ProductCategory[]
  pagination: Pagination
}

export interface CreateProductCategoryRequest {
  siteId: string
  languageCode: string
  key: string
  label: string
  slug?: string
  iconId?: string | null
  backgroundColor?: string
  order?: number
}

export type UpdateProductCategoryRequest = Partial<CreateProductCategoryRequest>

export interface ProductCategoryFiltersRequest {
  siteId?: string
  languageCode?: string
  key?: string
  page?: number
  pageSize?: number
}

export const productCategoryActions = {
  getAll: async (filters?: ProductCategoryFiltersRequest) => {
    const response = await axiosInstance.get<ProductCategoryListResponse>(
      API_ENDPOINTS.PRODUCT_CATEGORIES.BASE,
      { params: filters }
    )
    return response.data
  },

  getByLanguage: async (languageCode: string) => {
    const response = await axiosInstance.get<ProductCategory>(
      API_ENDPOINTS.PRODUCT_CATEGORIES.BY_LANGUAGE(languageCode)
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ProductCategory>(
      API_ENDPOINTS.PRODUCT_CATEGORIES.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateProductCategoryRequest) => {
    const response = await axiosInstance.post<ProductCategory>(
      API_ENDPOINTS.PRODUCT_CATEGORIES.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateProductCategoryRequest) => {
    const response = await axiosInstance.put<ProductCategory>(
      API_ENDPOINTS.PRODUCT_CATEGORIES.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.PRODUCT_CATEGORIES.BY_ID(id))
  },
}
