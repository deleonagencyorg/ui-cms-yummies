import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface RecipeBrandResponse {
  id: string
  name: string
  slug: string
}

export interface RecipeProductResponse {
  id: string
  name: string
  slug: string
}

export interface RecipeResponse {
  id: string
  title: string
  slug: string
  date: string
  people: string
  difficulty: string
  image: string
  gallery: string[]
  type: string
  preparationTime: number
  ingredients: string[]
  category: string
  instructions: string[]
  languageCode: string
  brands: RecipeBrandResponse[]
  products: RecipeProductResponse[]
  createdAt: string
}

export interface RecipeListResponse {
  data: RecipeResponse[]
  pagination: Pagination
}

export interface CreateRecipeRequest {
  title: string
  slug: string
  date?: string
  people?: string
  difficulty?: string
  image?: string
  gallery?: string[]
  type?: string
  preparationTime?: number
  ingredients?: string[]
  category?: string
  instructions?: string[]
  languageCode: string
  brandIds?: string[]
  productIds?: string[]
}

export interface UpdateRecipeRequest {
  title?: string
  slug?: string
  date?: string
  people?: string
  difficulty?: string
  image?: string
  gallery?: string[]
  type?: string
  preparationTime?: number
  ingredients?: string[]
  category?: string
  instructions?: string[]
  languageCode?: string
  brandIds?: string[]
  productIds?: string[]
}

export interface RecipeFiltersRequest {
  title?: string
  slug?: string
  category?: string
  difficulty?: string
  languageCode?: string
  brandId?: string
  productId?: string
  page?: number
  pageSize?: number
}

export const recipeActions = {
  getAll: async (filters?: RecipeFiltersRequest) => {
    const response = await axiosInstance.get<RecipeListResponse>(
      API_ENDPOINTS.RECIPES.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<RecipeResponse>(
      API_ENDPOINTS.RECIPES.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateRecipeRequest) => {
    const response = await axiosInstance.post<RecipeResponse>(
      API_ENDPOINTS.RECIPES.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateRecipeRequest) => {
    const response = await axiosInstance.put<RecipeResponse>(
      API_ENDPOINTS.RECIPES.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.RECIPES.BY_ID(id))
  },
}
