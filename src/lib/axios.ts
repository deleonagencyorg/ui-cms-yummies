import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_ENDPOINTS, TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/constants/api'
import type { AuthResponse, RefreshTokenRequest } from '@/types/auth.types'
import { getActiveSiteId, setActiveSiteId } from '@/lib/activeSite'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const SITE_SCOPED_PREFIXES = ['/multimedia', '/folders', '/products', '/recipes', '/news']

const attachActiveSite = (config: InternalAxiosRequestConfig) => {
  const siteId = getActiveSiteId()
  const path = config.url?.split('?')[0] ?? ''
  if (!siteId || !SITE_SCOPED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return config
  }

  if (!config.params?.siteId) {
    config.params = { ...config.params, siteId }
  }

  const isMediaLibrary = path.startsWith('/multimedia') || path.startsWith('/folders')
  if (config.method?.toLowerCase() === 'post' && isMediaLibrary) {
    if (config.data instanceof FormData) {
      if (!config.data.has('siteId')) config.data.append('siteId', siteId)
    } else if (config.data && typeof config.data === 'object' && !('siteId' in config.data)) {
      config.data = { ...config.data, siteId }
    } else if (!config.data) {
      config.data = { siteId }
    }
  }

  return config
}

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

// Request interceptor to add token to headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return attachActiveSite(config)
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }

    // Skip token refresh for login and other auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                          originalRequest.url?.includes('/auth/forgot-password') ||
                          originalRequest.url?.includes('/auth/reset-password')

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return axiosInstance(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)

      if (!refreshToken) {
        // No refresh token, logout user
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
        setActiveSiteId(null)
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post<AuthResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken } as RefreshTokenRequest
        )

        const { accessToken, refreshToken: newRefreshToken } = response.data

        localStorage.setItem(TOKEN_STORAGE_KEY, accessToken)
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
        }

        processQueue(null, accessToken)
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as Error, null)
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
        setActiveSiteId(null)
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
