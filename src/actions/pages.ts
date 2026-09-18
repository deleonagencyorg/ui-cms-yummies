import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'
import type { MultimediaResponse } from './multimedia'

export type PageBannerType = 'image' | 'video' | 'html'

export interface PageBannerHTMLResponse {
  backgroundImage?: MultimediaResponse | null
  backgroundImageMobile?: MultimediaResponse | null
  image?: MultimediaResponse | null
  imageMobile?: MultimediaResponse | null
  title?: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonUrl?: string
}

export interface PageBannerResponse {
  id: string
  type: PageBannerType
  desktop?: MultimediaResponse | null
  mobile?: MultimediaResponse | null
  alt?: string
  title?: string
  subtitle?: string
  description?: string
  link?: string
  html?: PageBannerHTMLResponse | null
  order: number
}

export interface PageBannerHTMLRequest {
  backgroundMediaId?: string | null
  backgroundMobileMediaId?: string | null
  imageMediaId?: string | null
  imageMobileMediaId?: string | null
  title?: string
  subtitle?: string
  description?: string
  buttonText?: string
  buttonUrl?: string
}

export interface CreatePageBannerRequest {
  type: PageBannerType
  desktopMediaId?: string | null
  mobileMediaId?: string | null
  alt?: string
  title?: string
  subtitle?: string
  description?: string
  link?: string
  html?: PageBannerHTMLRequest
  order?: number
}

export interface PageResponse {
  id: string
  siteId: string
  site?: {
    id: string
    name: string
    domain: string
  }
  languageCode: string
  language?: {
    code: string
    name: string
    nativeName: string
  }
  title: string
  slug: string
  content?: string
  excerpt?: string
  featuredImageId?: string
  featuredImage?: {
    id: string
    fileName: string
    originalUrl: string
    thumbnailUrl?: string
  }
  status: 'draft' | 'published' | 'scheduled' | 'trash'
  publishedAt?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImageId?: string
  ogImage?: {
    id: string
    fileName: string
    originalUrl: string
    thumbnailUrl?: string
  }
  canonicalUrl?: string
  robotsMeta: string
  authorId: number
  author?: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
  parentId?: string
  template?: string
  order: number
  isHomepage: boolean
  showInMenu: boolean
  showBreadcrumbs: boolean
  showPageTitle: boolean
  sidebarPosition: string
  containerWidth: string
  requireAuth: boolean
  allowedRoles?: string
  customCss?: string
  customJs?: string
  headerScripts?: string
  footerScripts?: string
  abTestEnabled: boolean
  abTestConfig?: string
  banners?: PageBannerResponse[]
  createdAt: string
  updatedAt: string
}

export interface PageListResponse {
  data: PageResponse[]
  pagination: Pagination
}

export interface CreatePageRequest {
  siteId: string
  languageCode: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImageId?: string
  status?: 'draft' | 'published' | 'scheduled' | 'trash'
  publishedAt?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImageId?: string
  canonicalUrl?: string
  robotsMeta?: string
  parentId?: string
  template?: string
  order?: number
  isHomepage?: boolean
  showInMenu?: boolean
  showBreadcrumbs?: boolean
  showPageTitle?: boolean
  sidebarPosition?: string
  containerWidth?: string
  requireAuth?: boolean
  allowedRoles?: string
  customCss?: string
  customJs?: string
  headerScripts?: string
  footerScripts?: string
  abTestEnabled?: boolean
  abTestConfig?: string
  banners?: CreatePageBannerRequest[]
}

export interface UpdatePageRequest {
  siteId?: string
  languageCode?: string
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  featuredImageId?: string
  status?: 'draft' | 'published' | 'scheduled' | 'trash'
  publishedAt?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImageId?: string
  canonicalUrl?: string
  robotsMeta?: string
  parentId?: string
  template?: string
  order?: number
  isHomepage?: boolean
  showInMenu?: boolean
  showBreadcrumbs?: boolean
  showPageTitle?: boolean
  sidebarPosition?: string
  containerWidth?: string
  requireAuth?: boolean
  allowedRoles?: string
  customCss?: string
  customJs?: string
  headerScripts?: string
  footerScripts?: string
  abTestEnabled?: boolean
  abTestConfig?: string
  banners?: CreatePageBannerRequest[]
}

export interface PageFiltersRequest {
  siteId?: string
  title?: string
  slug?: string
  status?: string
  authorId?: number
  page?: number
  pageSize?: number
}

export const pageActions = {
  getAll: async (filters?: PageFiltersRequest) => {
    const response = await axiosInstance.get<PageListResponse>(
      API_ENDPOINTS.PAGES.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<PageResponse>(
      API_ENDPOINTS.PAGES.BY_ID(id)
    )
    return response.data
  },

  create: async (data: CreatePageRequest) => {
    const response = await axiosInstance.post<PageResponse>(
      API_ENDPOINTS.PAGES.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdatePageRequest) => {
    const response = await axiosInstance.put<PageResponse>(
      API_ENDPOINTS.PAGES.BY_ID(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.PAGES.BY_ID(id))
  },
}
