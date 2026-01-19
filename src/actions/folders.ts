import axiosInstance from '@/lib/axios'
import { API_ENDPOINTS } from '@/constants/api'
import type { Pagination } from './departments'
import type { MultimediaResponse } from './multimedia'

export interface FolderResponse {
  id: string
  name: string
  parentId?: string | null
  createdBy: number
  children?: FolderResponse[]
  createdAt: string
  updatedAt: string
}

export interface FolderContentsResponse {
  folder: FolderResponse | null
  folders: FolderResponse[]
  multimedia: MultimediaResponse[]
  pagination: Pagination
}

export interface FolderListResponse {
  data: FolderResponse[]
  pagination: Pagination
}

export interface CreateFolderRequest {
  name: string
  parentId?: string | null
}

export interface UpdateFolderRequest {
  name?: string
  parentId?: string | null
}

export interface MoveFolderRequest {
  parentId: string | null
}

export interface FolderFiltersRequest {
  parentId?: string | null
  name?: string
  page?: number
  pageSize?: number
}

export interface FolderContentsFiltersRequest {
  page?: number
  pageSize?: number
  fileName?: string
  fileType?: string
}

export const folderActions = {
  getAll: async (filters?: FolderFiltersRequest) => {
    const response = await axiosInstance.get<FolderListResponse>(
      API_ENDPOINTS.FOLDERS.BASE,
      { params: filters }
    )
    return response.data
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get<FolderResponse>(
      API_ENDPOINTS.FOLDERS.BY_ID(id)
    )
    return response.data
  },

  getContents: async (folderId?: string | null, filters?: FolderContentsFiltersRequest) => {
    const url = folderId
      ? API_ENDPOINTS.FOLDERS.CONTENTS_BY_ID(folderId)
      : API_ENDPOINTS.FOLDERS.CONTENTS
    const response = await axiosInstance.get<FolderContentsResponse>(url, { params: filters })
    return response.data
  },

  create: async (data: CreateFolderRequest) => {
    const response = await axiosInstance.post<FolderResponse>(
      API_ENDPOINTS.FOLDERS.BASE,
      data
    )
    return response.data
  },

  update: async (id: string, data: UpdateFolderRequest) => {
    const response = await axiosInstance.put<FolderResponse>(
      API_ENDPOINTS.FOLDERS.BY_ID(id),
      data
    )
    return response.data
  },

  move: async (id: string, data: MoveFolderRequest) => {
    const response = await axiosInstance.put<FolderResponse>(
      API_ENDPOINTS.FOLDERS.MOVE(id),
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API_ENDPOINTS.FOLDERS.BY_ID(id))
  },
}
