import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  newsActions,
  type CreateNewsRequest,
  type UpdateNewsRequest,
  type NewsResponse
} from '@/actions/news'
import { NEWS_KEYS } from '@/queries/news'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateNews = (
  options?: Omit<UseMutationOptions<NewsResponse, Error, CreateNewsRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<NewsResponse, Error, CreateNewsRequest>({
    ...options,
    mutationFn: newsActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: NEWS_KEYS.lists() })
      toast.success('News created successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to create news'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useUpdateNews = (
  options?: Omit<
    UseMutationOptions<NewsResponse, Error, { id: string; data: UpdateNewsRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<NewsResponse, Error, { id: string; data: UpdateNewsRequest }>({
    ...options,
    mutationFn: ({ id, data }) => newsActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: NEWS_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: NEWS_KEYS.detail(variables.id) })
      toast.success('News updated successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to update news'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteNews = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: newsActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: NEWS_KEYS.lists() })
      queryClient.removeQueries({ queryKey: NEWS_KEYS.detail(variables) })
      toast.success('News deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete news'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
