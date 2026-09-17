import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'
import type { MultimediaResponse } from './multimedia'

export interface GalleryImage {
  id: string
  siteId: string
  languageCode: string
  imageId: string | null
  image?: MultimediaResponse
  alt: string
  caption: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface GalleryImageListResponse {
  data: GalleryImage[]
  pagination: Pagination
}

export interface CreateGalleryImageRequest {
  siteId: string
  languageCode: string
  imageId?: string | null
  alt?: string
  caption?: string
  order?: number
}

export type UpdateGalleryImageRequest = Partial<CreateGalleryImageRequest>

export interface GalleryImageFiltersRequest {
  siteId?: string
  languageCode?: string
  page?: number
  pageSize?: number
}

export const galleryActions = {
  getAll: async (filters?: GalleryImageFiltersRequest) => {
    const response = await axiosInstance.get<GalleryImageListResponse>(
      API_ENDPOINTS.GALLERY.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<GalleryImage>(API_ENDPOINTS.GALLERY.BY_ID(id))
    return response.data
  },

  create: async (data: CreateGalleryImageRequest) => {
    const response = await axiosInstance.post<GalleryImage>(API_ENDPOINTS.GALLERY.BASE, data)
    return response.data
  },

  update: async (id: string, data: UpdateGalleryImageRequest) => {
    const response = await axiosInstance.put<GalleryImage>(API_ENDPOINTS.GALLERY.BY_ID(id), data)
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.GALLERY.BY_ID(id))
  },
}
