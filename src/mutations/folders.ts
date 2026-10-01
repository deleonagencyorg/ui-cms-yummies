import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  folderActions,
  type FolderResponse,
  type CreateFolderRequest,
  type UpdateFolderRequest,
  type MoveFolderRequest,
} from '@/actions/folders'
import { FOLDER_KEYS } from '@/queries/folders'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateFolder = (
  options?: Omit<UseMutationOptions<FolderResponse, Error, CreateFolderRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<FolderResponse, Error, CreateFolderRequest>({
    ...options,
    mutationFn: folderActions.create,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      toast.success('Folder created successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to create folder'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useUpdateFolder = (
  options?: Omit<
    UseMutationOptions<FolderResponse, Error, { id: string; data: UpdateFolderRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<FolderResponse, Error, { id: string; data: UpdateFolderRequest }>({
    ...options,
    mutationFn: ({ id, data }) => folderActions.update(id, data),
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.detail(variables.id) })
      toast.success('Folder renamed successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to rename folder'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useMoveFolder = (
  options?: Omit<
    UseMutationOptions<FolderResponse, Error, { id: string; data: MoveFolderRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<FolderResponse, Error, { id: string; data: MoveFolderRequest }>({
    ...options,
    mutationFn: ({ id, data }) => folderActions.move(id, data),
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.detail(variables.id) })
      toast.success('Folder moved successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to move folder'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteFolder = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: folderActions.delete,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      queryClient.removeQueries({ queryKey: FOLDER_KEYS.detail(variables) })
      toast.success('Folder deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete folder. Make sure the folder is empty.'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
