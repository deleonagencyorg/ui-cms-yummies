import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

export interface FooterConfig {
  id: string
  siteId: string
  languageCode: string
  mainText: string
  description: string
  choose: string
  followUs: string
  contactUs: string
  instagramText: string
  facebookText: string
  email: string
  copyright: string
  privacyPolicyText: string
  privacyPolicyUrl: string
  newsletter: string
  newsletterDescription: string
  emailPlaceholder: string
  home: string
  products: string
  health: string
  latestNews: string
  contact: string
  support: string
  privacyPolicy: string
  cookiePolicy: string
  termsConditions: string
  complaintsBook: string
  help: string
  createdAt: string
  updatedAt: string
}

export interface FooterListResponse {
  data: FooterConfig[]
  pagination: Pagination
}

export interface CreateFooterConfigRequest {
  siteId: string
  languageCode: string
  mainText?: string
  description?: string
  choose?: string
  followUs?: string
  contactUs?: string
  instagramText?: string
  facebookText?: string
  email?: string
  copyright?: string
  privacyPolicyText?: string
  privacyPolicyUrl?: string
  newsletter?: string
  newsletterDescription?: string
  emailPlaceholder?: string
  home?: string
  products?: string
  health?: string
  latestNews?: string
  contact?: string
  support?: string
  privacyPolicy?: string
  cookiePolicy?: string
  termsConditions?: string
  complaintsBook?: string
  help?: string
}

export type UpdateFooterConfigRequest = Partial<CreateFooterConfigRequest>

export interface FooterFiltersRequest {
  mainText?: string
  languageCode?: string
  siteId?: string
  page?: number
  pageSize?: number
}

export const footerActions = {
  getAll: async (filters?: FooterFiltersRequest) => {
    const response = await axiosInstance.get<FooterListResponse>(
      API_ENDPOINTS.FOOTER.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<FooterConfig>(
      API_ENDPOINTS.FOOTER.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreateFooterConfigRequest) => {
    const response = await axiosInstance.post<FooterConfig>(
      API_ENDPOINTS.FOOTER.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateFooterConfigRequest) => {
    const response = await axiosInstance.put<FooterConfig>(
      API_ENDPOINTS.FOOTER.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.FOOTER.BY_ID(id))
  },
}
