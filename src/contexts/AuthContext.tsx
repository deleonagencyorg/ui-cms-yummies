/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode, useEffect } from 'react'

import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS, TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from '@/constants/api'
import type { LoginRequest, AuthResponse, UserResponse } from '@/types/auth.types'

interface AuthContextType {
  isAuthenticated: boolean
  user: UserResponse | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      const storedUser = localStorage.getItem('user')

      if (!token) {
        setLoading(false)
        return
      }

      // If we have a token but no user data, fetch from API
      if (!storedUser) {
        try {
          const response = await axiosInstance.get<UserResponse>(API_ENDPOINTS.AUTH.ME)
          const userData = response.data

          localStorage.setItem('user', JSON.stringify(userData))
          setUser(userData)
          setIsAuthenticated(true)
        } catch (err) {
          console.error('Failed to fetch user data:', err)
          // Token is invalid, clear everything
          localStorage.removeItem(TOKEN_STORAGE_KEY)
          localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
          localStorage.removeItem('user')
          setIsAuthenticated(false)
          setUser(null)
        }
      } else {
        // We have stored user data, use it
        try {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)

          // Optionally: Fetch fresh user data in the background
          axiosInstance.get<UserResponse>(API_ENDPOINTS.AUTH.ME)
            .then((response) => {
              const userData = response.data
              localStorage.setItem('user', JSON.stringify(userData))
              setUser(userData)
            })
            .catch((err) => {
              console.error('Failed to refresh user data:', err)
            })
        } catch (err) {
          console.error('Failed to parse stored user:', err)
          localStorage.removeItem(TOKEN_STORAGE_KEY)
          localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
          localStorage.removeItem('user')
        }
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password } as LoginRequest
      )

      const { accessToken, refreshToken } = response.data

      // Store tokens first so authenticated requests (e.g. /me) work immediately
      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken)
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)

      // Always fetch fresh user data from /me after login.
      // This keeps the frontend consistent even if the login response payload changes.
      const resolvedUser: UserResponse = (await axiosInstance.get<UserResponse>(API_ENDPOINTS.AUTH.ME)).data

      localStorage.setItem('user', JSON.stringify(resolvedUser))
      setUser(resolvedUser)
      setIsAuthenticated(true)
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Login failed. Please try again.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
    setError(null)
  }

  const refreshUser = async () => {
    try {
      const response = await axiosInstance.get<UserResponse>(API_ENDPOINTS.AUTH.ME)
      const userData = response.data
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } catch (err) {
      console.error('Failed to refresh user data:', err)
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, error, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
