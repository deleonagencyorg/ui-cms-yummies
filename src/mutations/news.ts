import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  newsActions,
  type CreateNewsRequest,
  type UpdateNewsRequest,
  type NewsResponse
} from '@/actions/news'
import { NEWS_KEYS } from '@/queries/news'

export const useCreateNews = (
  options?: Omit<UseMutationOptions<NewsResponse, Error, CreateNewsRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<NewsResponse, Error, CreateNewsRequest>({
    mutationFn: newsActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: NEWS_KEYS.lists() })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
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
    mutationFn: ({ id, data }) => newsActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: NEWS_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: NEWS_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}

export const useDeleteNews = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: newsActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: NEWS_KEYS.lists() })
      queryClient.removeQueries({ queryKey: NEWS_KEYS.detail(variables) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}
