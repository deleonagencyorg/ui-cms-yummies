import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { ChangePasswordRequest } from '@/types/auth.types'

export const authActions = {
  changePassword: async (data: ChangePasswordRequest) => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data)
  },
}
