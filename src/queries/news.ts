import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  newsActions,
  type NewsResponse,
  type NewsListResponse,
  type NewsFiltersRequest
} from '@/actions/news'

export const NEWS_KEYS = {
  all: ['news'] as const,
  lists: () => [...NEWS_KEYS.all, 'list'] as const,
  list: (filters?: NewsFiltersRequest) => [...NEWS_KEYS.lists(), filters] as const,
  details: () => [...NEWS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...NEWS_KEYS.details(), id] as const,
}

export const useNews = (
  filters?: NewsFiltersRequest,
  options?: Omit<UseQueryOptions<NewsListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<NewsListResponse, Error>({
    queryKey: NEWS_KEYS.list(filters),
    queryFn: () => newsActions.getAll(filters),
    ...options,
  })
}

export const useNewsById = (
  id: string,
  options?: Omit<UseQueryOptions<NewsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<NewsResponse, Error>({
    queryKey: NEWS_KEYS.detail(id),
    queryFn: () => newsActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
