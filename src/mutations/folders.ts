import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  folderActions,
  type FolderResponse,
  type CreateFolderRequest,
  type UpdateFolderRequest,
  type MoveFolderRequest,
} from '@/actions/folders'
import { FOLDER_KEYS } from '@/queries/folders'

export const useCreateFolder = (
  options?: Omit<UseMutationOptions<FolderResponse, Error, CreateFolderRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<FolderResponse, Error, CreateFolderRequest>({
    mutationFn: folderActions.create,
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      options?.onSuccess?.(data, variables, context)
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
    mutationFn: ({ id, data }) => folderActions.update(id, data),
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context)
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
    mutationFn: ({ id, data }) => folderActions.move(id, data),
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useDeleteFolder = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: folderActions.delete,
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      queryClient.removeQueries({ queryKey: FOLDER_KEYS.detail(variables) })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
