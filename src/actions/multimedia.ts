import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface MultimediaResponse {
  id: string
  fileName: string
  filePath: string
  fileType: string
  mimeType: string
  fileSize: number
  originalUrl: string
  optimizedUrl?: string
  thumbnailUrl?: string
  width?: number
  height?: number
  duration?: number
  altText?: string
  caption?: string
  uploadedBy: number
  createdAt: string
  updatedAt: string
}

export interface MultimediaListResponse {
  data: MultimediaResponse[]
  pagination: Pagination
}

export interface UpdateMultimediaRequest {
  altText?: string
  caption?: string
}

export interface MultimediaFiltersRequest {
  fileName?: string
  fileType?: string
  minSize?: number
  maxSize?: number
  userId?: number
  byMe?: boolean
  page?: number
  pageSize?: number
}

export interface UploadMultimediaRequest {
  file: File
  altText?: string
  caption?: string
}

export const multimediaActions = {
  getAll: async (filters?: MultimediaFiltersRequest) => {
    const response = await axiosInstance.get<MultimediaListResponse>(
      API_ENDPOINTS.MULTIMEDIA.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<MultimediaResponse>(
      API_ENDPOINTS.MULTIMEDIA.BY_ID(id)
    )
    return response.data
  },

  upload: async (data: UploadMultimediaRequest) => {
    const formData = new FormData()
    formData.append('file', data.file)
    if (data.altText) formData.append('altText', data.altText)
    if (data.caption) formData.append('caption', data.caption)

    const response = await axiosInstance.post<MultimediaResponse>(
      API_ENDPOINTS.MULTIMEDIA.BASE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  update: async (id: string, data: UpdateMultimediaRequest) => {
    const response = await axiosInstance.put<MultimediaResponse>(
      API_ENDPOINTS.MULTIMEDIA.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.MULTIMEDIA.BY_ID(id))
  },
}
