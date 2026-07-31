import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  apiTokenActions,
  type CreateApiTokenRequest,
  type ApiTokenCreateResponse,
} from '@/actions/apiTokens'
import { API_TOKEN_KEYS } from '@/queries/apiTokens'

export const useCreateApiToken = (
  options?: Omit<UseMutationOptions<ApiTokenCreateResponse, Error, CreateApiTokenRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<ApiTokenCreateResponse, Error, CreateApiTokenRequest>({
    mutationFn: apiTokenActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: API_TOKEN_KEYS.lists() })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}

export const useRevokeApiToken = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: apiTokenActions.revoke,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: API_TOKEN_KEYS.lists() })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}

export const useDeleteApiToken = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: apiTokenActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: API_TOKEN_KEYS.lists() })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}
