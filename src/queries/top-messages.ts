import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  topMessageActions,
  type TopMessageResponse,
  type TopMessageFiltersRequest,
} from '@/actions/top-messages'

export const TOP_MESSAGE_KEYS = {
  all: ['top-messages'] as const,
  lists: (filters?: TopMessageFiltersRequest) => [...TOP_MESSAGE_KEYS.all, 'list', filters] as const,
}

export const useTopMessages = (
  filters?: TopMessageFiltersRequest,
  options?: Omit<UseQueryOptions<TopMessageResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TopMessageResponse[], Error>({
    queryKey: TOP_MESSAGE_KEYS.lists(filters),
    queryFn: () => topMessageActions.getAll(filters),
    ...options,
  })
}