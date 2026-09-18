import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  multimediaActions,
  type MultimediaResponse,
  type CreateMultimediaRequest,
  type UpdateMultimediaRequest,
  type MoveMultimediaRequest,
} from '@/actions/multimedia'
import { MULTIMEDIA_KEYS } from '@/queries/multimedia'
import { FOLDER_KEYS } from '@/queries/folders'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useUploadMultimedia = (
  options?: Omit<UseMutationOptions<MultimediaResponse, Error, CreateMultimediaRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<MultimediaResponse, Error, CreateMultimediaRequest>({
    ...options,
    mutationFn: multimediaActions.create,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      toast.success('File uploaded successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to upload file.'))
      options?.onError?.(error, variables, context, mutation)
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
    ...options,
    mutationFn: ({ id, data }) => multimediaActions.update(id, data),
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.detail(variables.id) })
      toast.success('Media updated successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to update media'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteMultimedia = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: multimediaActions.delete,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      queryClient.removeQueries({ queryKey: MULTIMEDIA_KEYS.detail(variables) })
      toast.success('Media deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete media'))
      options?.onError?.(error, variables, context, mutation)
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
    ...options,
    mutationFn: ({ id, data }) => multimediaActions.move(id, data),
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: FOLDER_KEYS.contents() })
      await queryClient.invalidateQueries({ queryKey: MULTIMEDIA_KEYS.detail(variables.id) })
      toast.success('Media moved successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to move media'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
