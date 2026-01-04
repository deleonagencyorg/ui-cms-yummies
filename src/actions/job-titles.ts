import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { DepartmentResponse, Pagination } from './departments'

export interface JobTitleResponse {
  id: string
  name: string
  departmentId?: string | null
  department?: DepartmentResponse | null
  createdAt: string
  updatedAt: string
}

export interface JobTitleListResponse {
  data: JobTitleResponse[]
  pagination: Pagination
}

export interface CreateJobTitleRequest {
  name: string
  departmentId?: string | null
}

export interface UpdateJobTitleRequest {
  name?: string
  departmentId?: string | null
}

export interface JobTitleFiltersRequest {
  name?: string
  departmentId?: string
  page?: number
  pageSize?: number
}

export const jobTitleActions = {
  getAll: async (filters?: JobTitleFiltersRequest) => {
    const response = await axiosInstance.get<JobTitleListResponse>(
      API_ENDPOINTS.JOB_TITLES.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<JobTitleResponse>(API_ENDPOINTS.JOB_TITLES.BY_ID(id))
    return response.data
  },

  create: async (data: CreateJobTitleRequest) => {
    const response = await axiosInstance.post<JobTitleResponse>(API_ENDPOINTS.JOB_TITLES.BASE, data)
    return response.data
  },

  update: async (id: string, data: UpdateJobTitleRequest) => {
    const response = await axiosInstance.put<JobTitleResponse>(API_ENDPOINTS.JOB_TITLES.BY_ID(id), data)
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.JOB_TITLES.BY_ID(id))
  },
}
