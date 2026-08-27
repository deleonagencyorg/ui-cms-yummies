import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'

export interface Pagination {
  page: number
  pageCount: number
  pageSize: number
  total: number
}

export interface ApiTokenScopes {
  brands?: 'r' | 'rw'
  products?: 'r' | 'rw'
  recipes?: 'r' | 'rw'
  news?: 'r' | 'rw'
  sites?: 'r' | 'rw'
  pages?: 'r' | 'rw'
  top_messages?: 'r' | 'rw'
}

export interface ApiTokenResponse {
  id: string
  name: string
  scopes: ApiTokenScopes
  expiresAt: string
  revokedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ApiTokenCreateResponse extends ApiTokenResponse {
  token: string
}

export interface ApiTokenListResponse {
  tokens: ApiTokenResponse[]
  pagination: Pagination
}

export interface CreateApiTokenRequest {
  name: string
  scopes: ApiTokenScopes
  expiresAt: string
}

export interface ApiTokenFiltersRequest {
  page?: number
  pageSize?: number
}

export const apiTokenActions = {
  getAll: async (filters?: ApiTokenFiltersRequest) => {
    const response = await axiosInstance.get<ApiTokenListResponse>(
      API_ENDPOINTS.API_TOKENS.BASE,
      { params: filters }
    )
    return response.data
  },

  create: async (data: CreateApiTokenRequest) => {
    const response = await axiosInstance.post<ApiTokenCreateResponse>(
      API_ENDPOINTS.API_TOKENS.BASE,
      data
    )
    return response.data
  },

  revoke: async (id: string) => {
    await axiosInstance.post(API_ENDPOINTS.API_TOKENS.REVOKE(id))
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.API_TOKENS.BY_ID(id))
  },
}
