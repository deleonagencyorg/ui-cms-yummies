import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'
import type { JobTitleResponse } from './job-titles'

export interface UserResponse {
  id: number
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ProfileResponse {
  id: string
  userId: number
  user?: UserResponse | null
  firstName: string
  lastName: string
  avatar?: string | null
  birthday?: string | null
  gender: 'unspecified' | 'male' | 'female' | 'other'
  employeeId?: string | null
  workEmail?: string | null
  workPhone?: string | null
  jobTitleId?: string | null
  jobTitle?: JobTitleResponse | null
  location?: string | null
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'leave'
  hireDate?: string | null
  terminationDate?: string | null
  bossUserId?: number | null
  boss?: UserResponse | null
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ProfileListResponse {
  data: ProfileResponse[]
  pagination: Pagination
}

export interface CreateProfileRequest {
  // User fields
  email: string
  password?: string | null
  // Profile fields
  firstName: string
  lastName: string
  avatar?: string | null
  birthday?: string | null
  gender?: 'unspecified' | 'male' | 'female' | 'other'
  employeeId?: string | null
  workEmail?: string | null
  workPhone?: string | null
  jobTitleId?: string | null
  location?: string | null
  employmentStatus?: 'active' | 'inactive' | 'terminated' | 'leave'
  hireDate?: string | null
  terminationDate?: string | null
  bossUserId?: number | null
  metadata?: Record<string, unknown>
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  avatar?: string | null
  birthday?: string | null
  gender?: 'unspecified' | 'male' | 'female' | 'other'
  employeeId?: string | null
  workEmail?: string | null
  workPhone?: string | null
  jobTitleId?: string | null
  location?: string | null
  employmentStatus?: 'active' | 'inactive' | 'terminated' | 'leave'
  hireDate?: string | null
  terminationDate?: string | null
  bossUserId?: number | null
  metadata?: Record<string, unknown>
}

export interface ProfileFiltersRequest {
  userId?: number
  employmentStatus?: string
  jobTitleId?: string
  bossUserId?: number
  firstName?: string
  lastName?: string
  page?: number
  pageSize?: number
}

export const profileActions = {
  getAll: async (filters?: ProfileFiltersRequest) => {
    const response = await axiosInstance.get<ProfileListResponse>(
      API_ENDPOINTS.PROFILES.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ProfileResponse>(API_ENDPOINTS.PROFILES.BY_ID(id))
    return response.data
  },

  create: async (data: CreateProfileRequest) => {
    const response = await axiosInstance.post<ProfileResponse>(API_ENDPOINTS.PROFILES.BASE, data)
    return response.data
  },

  update: async (id: string, data: UpdateProfileRequest) => {
    const response = await axiosInstance.put<ProfileResponse>(API_ENDPOINTS.PROFILES.BY_ID(id), data)
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.PROFILES.BY_ID(id))
  },
}
