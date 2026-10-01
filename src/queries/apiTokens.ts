import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  apiTokenActions,
  type ApiTokenListResponse,
  type ApiTokenFiltersRequest
} from '@/actions/apiTokens'

export const API_TOKEN_KEYS = {
  all: ['api-tokens'] as const,
  lists: () => [...API_TOKEN_KEYS.all, 'list'] as const,
  list: (filters?: ApiTokenFiltersRequest) => [...API_TOKEN_KEYS.lists(), filters] as const,
}

export const useApiTokens = (
  filters?: ApiTokenFiltersRequest,
  options?: Omit<UseQueryOptions<ApiTokenListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ApiTokenListResponse, Error>({
    queryKey: API_TOKEN_KEYS.list(filters),
    queryFn: () => apiTokenActions.getAll(filters),
    ...options,
  })
}
