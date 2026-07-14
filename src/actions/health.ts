import axiosInstance from '@/lib/axios'

export const healthActions = {
  saveConfig: async (data: any) => {
    const response = await axiosInstance.post('/health/config', data)
    return response.data
  },

  getConfig: async () => {
    const response = await axiosInstance.get('/health/config')
    return response.data
  },
}