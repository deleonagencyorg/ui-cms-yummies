import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { MultimediaResponse } from './multimedia'

export type SectionListEndpoint =
  (typeof API_ENDPOINTS.SECTION_LISTS)[keyof typeof API_ENDPOINTS.SECTION_LISTS]

export interface FooterPhone {
  id?: string
  country: string
  flag: string
  flagImageId?: string | null
  flagImageUrl?: string
  number: string
}

export interface HealthIcon {
  id?: string
  title: string
  description: string
  imageId: string | null
  imageUrl?: string
  image?: MultimediaResponse
  linkUrl: string
}

export interface HomeVideo {
  id?: string
  title: string
  description: string
  videoId: string | null
  video?: MultimediaResponse
  imageId: string | null
  imageUrl?: string
  image?: MultimediaResponse
}

export interface AboutTimelineItem {
  id?: string
  year: string
  text: string
  imageId: string | null
  imageUrl?: string
  image?: MultimediaResponse
  mobileImageId: string | null
  mobileImageUrl?: string
  mobileImage?: MultimediaResponse
}

export interface SectionListResponse<T> {
  data: T[]
}

export const sectionListActions = {
  getAll: async <T>(endpoint: SectionListEndpoint, siteId: string, languageCode: string) => {
    const response = await axiosInstance.get<SectionListResponse<T>>(endpoint, {
      params: { siteId, languageCode },
    })
    return response.data
  },

  replace: async <T>(endpoint: SectionListEndpoint, siteId: string, languageCode: string, items: T[]) => {
    const response = await axiosInstance.put<SectionListResponse<T>>(endpoint, {
      siteId,
      languageCode,
      items,
    })
    return response.data
  },
}
