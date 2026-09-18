import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { MultimediaResponse } from '@/actions/multimedia'
import type { Pagination } from './departments'

export interface ZambosTruckPackageImage {
  id: string
  image: MultimediaResponse | null
  order: number
}

export interface ZambosTruckStep {
  id: string
  icon: string
  title: string
  description: string
  order: number
}

export interface ZambosTruckModel {
  id: string
  name: string
  image: MultimediaResponse | null
  order: number
}

export interface ZambosTruckRecipe {
  id: string
  title: string
  description: string
  image: MultimediaResponse | null
  price: string
  order: number
}

export interface ZambosTruckGalleryImage {
  id: string
  image: MultimediaResponse | null
  category: string
  order: number
}

export interface ZambosTruckFormField {
  id: string
  name: string
  label: string
  type: string
  required: boolean
  options: string[]
  order: number
}

export interface ZambosTruckConfig {
  id: string
  siteId: string
  languageCode: string
  heroTitle: string
  heroSubtitle: string
  heroCtaLabel: string
  heroCtaUrl: string
  heroVideo: MultimediaResponse | null
  heroBanner: MultimediaResponse | null
  packagesTitle: string
  packagesSubtitle: string
  packageImages: ZambosTruckPackageImage[]
  howToTitle: string
  howToSubtitle: string
  howToSteps: ZambosTruckStep[]
  modelsTitle: string
  models: ZambosTruckModel[]
  recipesTitle: string
  recipesSubtitle: string
  recipes: ZambosTruckRecipe[]
  galleryTitle: string
  galleryImages: ZambosTruckGalleryImage[]
  formTitle: string
  formDescription: string
  formSubmitLabel: string
  formFields: ZambosTruckFormField[]
  ctaJoinTitle: string
  ctaJoinButtonLabel: string
  ctaJoinButtonUrl: string
  whatsappPhone: string
  whatsappMessage: string
  createdAt: string
  updatedAt: string
}

export interface ZambosTruckListResponse {
  data: ZambosTruckConfig[]
  pagination: Pagination
}

export interface CreateZambosTruckPackageImageRequest {
  imageId?: string | null
  order?: number
}

export interface CreateZambosTruckStepRequest {
  icon?: string
  title?: string
  description?: string
  order?: number
}

export interface CreateZambosTruckModelRequest {
  name?: string
  imageId?: string | null
  order?: number
}

export interface CreateZambosTruckRecipeRequest {
  title?: string
  description?: string
  imageId?: string | null
  price?: string
  order?: number
}

export interface CreateZambosTruckGalleryImageRequest {
  imageId?: string | null
  category?: string
  order?: number
}

export interface CreateZambosTruckFormFieldRequest {
  name: string
  label?: string
  type: string
  required?: boolean
  options?: string[]
  order?: number
}

export interface CreateZambosTruckConfigRequest {
  siteId: string
  languageCode: string
  heroTitle?: string
  heroSubtitle?: string
  heroCtaLabel?: string
  heroCtaUrl?: string
  heroVideoId?: string | null
  heroBannerId?: string | null
  packagesTitle?: string
  packagesSubtitle?: string
  packageImages?: CreateZambosTruckPackageImageRequest[]
  howToTitle?: string
  howToSubtitle?: string
  howToSteps?: CreateZambosTruckStepRequest[]
  modelsTitle?: string
  models?: CreateZambosTruckModelRequest[]
  recipesTitle?: string
  recipesSubtitle?: string
  recipes?: CreateZambosTruckRecipeRequest[]
  galleryTitle?: string
  galleryImages?: CreateZambosTruckGalleryImageRequest[]
  formTitle?: string
  formDescription?: string
  formSubmitLabel?: string
  formFields?: CreateZambosTruckFormFieldRequest[]
  ctaJoinTitle?: string
  ctaJoinButtonLabel?: string
  ctaJoinButtonUrl?: string
  whatsappPhone?: string
  whatsappMessage?: string
}

export type UpdateZambosTruckConfigRequest = CreateZambosTruckConfigRequest

export interface ZambosTruckFiltersRequest {
  languageCode?: string
  siteId?: string
  page?: number
  pageSize?: number
}

export const zambosTruckActions = {
  getAll: async (filters?: ZambosTruckFiltersRequest) => {
    const response = await axiosInstance.get<ZambosTruckListResponse>(
      API_ENDPOINTS.ZAMBOS_TRUCK.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<ZambosTruckConfig>(
      API_ENDPOINTS.ZAMBOS_TRUCK.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateZambosTruckConfigRequest) => {
    const response = await axiosInstance.post<ZambosTruckConfig>(
      API_ENDPOINTS.ZAMBOS_TRUCK.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateZambosTruckConfigRequest) => {
    const response = await axiosInstance.put<ZambosTruckConfig>(
      API_ENDPOINTS.ZAMBOS_TRUCK.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.ZAMBOS_TRUCK.BY_ID(id))
  },
}
