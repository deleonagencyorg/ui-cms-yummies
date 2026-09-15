import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  topMessageActions,
  type CreateTopMessageRequest,
  type UpdateTopMessageRequest,
  type TopMessageResponse
} from '@/actions/top-messages'
import { TOP_MESSAGE_KEYS } from '@/queries/top-messages'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateTopMessage = (
  options?: Omit<UseMutationOptions<TopMessageResponse, Error, CreateTopMessageRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<TopMessageResponse, Error, CreateTopMessageRequest>({
    ...options,
    mutationFn: topMessageActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: TOP_MESSAGE_KEYS.lists() })
      toast.success('Top Message created successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to create top message'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useUpdateTopMessage = (
  options?: Omit<UseMutationOptions<TopMessageResponse, Error, { id: string; data: UpdateTopMessageRequest }>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<TopMessageResponse, Error, { id: string; data: UpdateTopMessageRequest }>({
    ...options,
    mutationFn: ({ id, data }) => topMessageActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: TOP_MESSAGE_KEYS.lists() })
      toast.success('Top Message updated successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to update top message'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteTopMessage = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: topMessageActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: TOP_MESSAGE_KEYS.lists() })
      toast.success('Top Message deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete top message'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
