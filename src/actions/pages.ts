import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'

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
