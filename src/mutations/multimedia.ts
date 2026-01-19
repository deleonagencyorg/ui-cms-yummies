import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  multimediaActions,
  type MultimediaResponse,
  type UploadMultimediaRequest,
  type UpdateMultimediaRequest,
  type MoveMultimediaRequest,
} from '@/actions/multimedia'
import { MULTIMEDIA_KEYS } from '@/queries/multimedia'
import { FOLDER_KEYS } from '@/queries/folders'

export const useUploadMultimedia = (
  options?: Omit<UseMutationOptions<MultimediaResponse, Error, UploadMultimediaRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<MultimediaResponse, Error, UploadMultimediaRequest>({
    mutationFn: multimediaActions.upload,
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useUpdateMultimedia = (
  options?: Omit<
    UseMutationOptions<MultimediaResponse, Error, { id: string; data: UpdateMultimediaRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<MultimediaResponse, Error, { id: string; data: UpdateMultimediaRequest }>({
    mutationFn: ({ id, data }) => multimediaActions.update(id, data),
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useDeleteMultimedia = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: multimediaActions.delete,
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      queryClient.removeQueries({ queryKey: MULTIMEDIA_KEYS.detail(variables) })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useMoveMultimedia = (
  options?: Omit<
    UseMutationOptions<MultimediaResponse, Error, { id: string; data: MoveMultimediaRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<MultimediaResponse, Error, { id: string; data: MoveMultimediaRequest }>({
    mutationFn: ({ id, data }) => multimediaActions.move(id, data),
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
