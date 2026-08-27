import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  topMessageActions,
  type CreateTopMessageRequest,
  type UpdateTopMessageRequest,
  type TopMessageResponse
} from '@/actions/top-messages'
import { TOP_MESSAGE_KEYS } from '@/queries/top-messages'

export const useCreateTopMessage = (
  options?: Omit<UseMutationOptions<TopMessageResponse, Error, CreateTopMessageRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<TopMessageResponse, Error, CreateTopMessageRequest>({
    mutationFn: topMessageActions.create,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: TOP_MESSAGE_KEYS.lists() })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useUpdateTopMessage = (
  options?: Omit<UseMutationOptions<TopMessageResponse, Error, { id: string; data: UpdateTopMessageRequest }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<TopMessageResponse, Error, { id: string; data: UpdateTopMessageRequest }>({
    mutationFn: ({ id, data }) => topMessageActions.update(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: TOP_MESSAGE_KEYS.lists() })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useDeleteTopMessage = (
  options?: Omit<UseMutationOptions<void, Error, number | string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number | string>({
    mutationFn: topMessageActions.delete,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: TOP_MESSAGE_KEYS.lists() })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}