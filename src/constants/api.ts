export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9011/v1'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  ROOT: {
    CREATE_USER: '/root/create-user',
  },
  MULTIMEDIA: {
    BASE: '/multimedia',
    BY_ID: (id: string) => `/multimedia/${id}`,
    MOVE: (id: string) => `/multimedia/${id}/move`,
  },
  FOLDERS: {
    BASE: '/folders',
    BY_ID: (id: string) => `/folders/${id}`,
    MOVE: (id: string) => `/folders/${id}/move`,
    CONTENTS: '/folders/contents',
    CONTENTS_BY_ID: (id: string) => `/folders/${id}/contents`,
  },
  APPLICATIONS: {
    BASE: '/applications',
    BY_ID: (id: number) => `/applications/${id}`,
  },
  ACTIONS: {
    BASE: '/actions',
    BY_ID: (id: number) => `/actions/${id}`,
  },
  PERMISSIONS: {
    BASE: '/permissions',
    BY_ID: (id: number) => `/permissions/${id}`,
  },
  USER_PERMISSIONS: {
    BASE: '/user-permissions',
    MY_PERMISSIONS: '/user-permissions/me',
    MANAGE: '/user-permissions/manage',
    BY_ID: (id: number) => `/user-permissions/${id}`,
  },
  SITES: {
    BASE: '/sites',
    BY_ID: (id: string) => `/sites/${id}`,
  },
  LANGUAGES: {
    BASE: '/languages',
    BY_CODE: (code: string) => `/languages/${code}`,
  },
  PAGES: {
    BASE: '/pages',
    BY_ID: (id: string) => `/pages/${id}`,
  },
  DEPARTMENTS: {
    BASE: '/departments',
    BY_ID: (id: string) => `/departments/${id}`,
  },
  PROFILES: {
    BASE: '/profiles',
    BY_ID: (id: string) => `/profiles/${id}`,
  },
  JOB_TITLES: {
    BASE: '/job-titles',
    BY_ID: (id: string) => `/job-titles/${id}`,
  },
  BRANDS: {
    BASE: '/brands',
    BY_ID: (id: string) => `/brands/${id}`,
  },
} as const

export const TOKEN_STORAGE_KEY = 'access_token'
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token'
