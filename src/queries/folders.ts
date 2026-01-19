import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  folderActions,
  type FolderResponse,
  type FolderListResponse,
  type FolderContentsResponse,
  type FolderFiltersRequest,
  type FolderContentsFiltersRequest,
} from '@/actions/folders'

export const FOLDER_KEYS = {
  all: ['folders'] as const,
  lists: () => [...FOLDER_KEYS.all, 'list'] as const,
  list: (filters?: FolderFiltersRequest) => [...FOLDER_KEYS.lists(), filters] as const,
  details: () => [...FOLDER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FOLDER_KEYS.details(), id] as const,
  contents: () => [...FOLDER_KEYS.all, 'contents'] as const,
  content: (folderId?: string | null, filters?: FolderContentsFiltersRequest) =>
    [...FOLDER_KEYS.contents(), folderId, filters] as const,
}

export const useFolders = (
  filters?: FolderFiltersRequest,
  options?: Omit<UseQueryOptions<FolderListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<FolderListResponse, Error>({
    queryKey: FOLDER_KEYS.list(filters),
    queryFn: () => folderActions.getAll(filters),
    ...options,
  })
}

export const useFolderById = (
  id: string,
  options?: Omit<UseQueryOptions<FolderResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<FolderResponse, Error>({
    queryKey: FOLDER_KEYS.detail(id),
    queryFn: () => folderActions.getById(id),
    enabled: !!id,
    ...options,
  })
}

export const useFolderContents = (
  folderId?: string | null,
  filters?: FolderContentsFiltersRequest,
  options?: Omit<UseQueryOptions<FolderContentsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<FolderContentsResponse, Error>({
    queryKey: FOLDER_KEYS.content(folderId, filters),
    queryFn: () => folderActions.getContents(folderId, filters),
    ...options,
  })
}
