import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'

export interface Pagination {
  page: number
  pageCount: number
  pageSize: number
  total: number
}

export interface DepartmentResponse {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface DepartmentListResponse {
  data: DepartmentResponse[]
  pagination: Pagination
}

export interface CreateDepartmentRequest {
  name: string
}

export interface UpdateDepartmentRequest {
  name: string
}

export interface DepartmentFiltersRequest {
  name?: string
  page?: number
  pageSize?: number
}

export const departmentActions = {
  getAll: async (filters?: DepartmentFiltersRequest) => {
    const response = await axiosInstance.get<DepartmentListResponse>(
      API_ENDPOINTS.DEPARTMENTS.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<DepartmentResponse>(API_ENDPOINTS.DEPARTMENTS.BY_ID(id))
    return response.data
  },

  create: async (data: CreateDepartmentRequest) => {
    const response = await axiosInstance.post<DepartmentResponse>(API_ENDPOINTS.DEPARTMENTS.BASE, data)
    return response.data
  },

  update: async (id: string, data: UpdateDepartmentRequest) => {
    const response = await axiosInstance.put<DepartmentResponse>(API_ENDPOINTS.DEPARTMENTS.BY_ID(id), data)
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.DEPARTMENTS.BY_ID(id))
  },
}
