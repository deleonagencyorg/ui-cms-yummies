import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  topMessageActions,
  type TopMessageResponse
} from '@/actions/top-messages'

export const TOP_MESSAGE_KEYS = {
  all: ['top-messages'] as const,
  lists: () => [...TOP_MESSAGE_KEYS.all, 'list'] as const,
}

export const useTopMessages = (
  options?: Omit<UseQueryOptions<TopMessageResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<TopMessageResponse[], Error>({
    queryKey: TOP_MESSAGE_KEYS.lists(),
    queryFn: () => topMessageActions.getAll(),
    ...options,
  })
}