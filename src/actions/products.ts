import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface ProductSizeResponse {
  value: string
  image: string
}

export interface NutritionRowResponse {
  label: string
  value: string
}

export interface ProductNutritionResponse {
  title: string
  serving: string
  rows: NutritionRowResponse[]
  disclaimer: string
}

export interface ProductResponse {
  id: string
  name: string
  slug: string
  image: string
  imageMobile: string
  backgroundColor: string
  category: string
  headerTextColor: string
  colorButton: string
  textColor: string
  description: string
  available: string
  backgroundImage: string
  languageCode: string
  sizes: ProductSizeResponse[]
  weight: string[]
  nutrition: ProductNutritionResponse
  brandId: string
  createdAt: string
}

export interface ProductListResponse {
  data: ProductResponse[]
  pagination: Pagination
}

export interface ProductSizeRequest {
  value: string
  image?: string
}

export interface NutritionRowRequest {
  label: string
  value: string
}

export interface ProductNutritionRequest {
  title?: string
  serving?: string
  rows?: NutritionRowRequest[]
  disclaimer?: string
}

export interface CreateProductRequest {
  name: string
  slug: string
  image?: string
  imageMobile?: string
  backgroundColor?: string
  category?: string
  headerTextColor?: string
  colorButton?: string
  textColor?: string
  description?: string
  available?: string
  backgroundImage?: string
  languageCode: string
  sizes?: ProductSizeRequest[]
  weight?: string[]
  nutrition?: ProductNutritionRequest
  brandId: string
}

export interface UpdateProductRequest {
  name?: string
  slug?: string
  image?: string
  imageMobile?: string
  backgroundColor?: string
  category?: string
  headerTextColor?: string
  colorButton?: string
  textColor?: string
  description?: string
  available?: string
  backgroundImage?: string
  languageCode?: string
  sizes?: ProductSizeRequest[]
  weight?: string[]
  nutrition?: ProductNutritionRequest
  brandId?: string
}

export interface ProductFiltersRequest {
  name?: string
  slug?: string
  category?: string
  languageCode?: string
  brandId?: string
  page?: number
  pageSize?: number
}

export const productActions = {
  getAll: async (filters?: ProductFiltersRequest) => {
    const response = await axiosInstance.get<ProductListResponse>(
      API_ENDPOINTS.PRODUCTS.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ProductResponse>(
      API_ENDPOINTS.PRODUCTS.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateProductRequest) => {
    const response = await axiosInstance.post<ProductResponse>(
      API_ENDPOINTS.PRODUCTS.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateProductRequest) => {
    const response = await axiosInstance.put<ProductResponse>(
      API_ENDPOINTS.PRODUCTS.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id))
  },
}
