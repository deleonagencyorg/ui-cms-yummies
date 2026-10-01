import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  apiTokenActions,
  type CreateApiTokenRequest,
  type ApiTokenCreateResponse,
} from '@/actions/apiTokens'
import { API_TOKEN_KEYS } from '@/queries/apiTokens'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateApiToken = (
  options?: Omit<UseMutationOptions<ApiTokenCreateResponse, Error, CreateApiTokenRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<ApiTokenCreateResponse, Error, CreateApiTokenRequest>({
    ...options,
    mutationFn: apiTokenActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: API_TOKEN_KEYS.lists() })
      toast.success('API Token created successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to create API token'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useRevokeApiToken = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: apiTokenActions.revoke,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: API_TOKEN_KEYS.lists() })
      toast.success('API Token revoked successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to revoke API token'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteApiToken = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: apiTokenActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: API_TOKEN_KEYS.lists() })
      toast.success('API Token deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete API token'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
