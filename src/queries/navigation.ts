import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  navigationActions,
  type NavigationConfig,
  type NavigationListResponse,
  type NavigationFiltersRequest,
} from '@/actions/navigation'

export const NAVIGATION_KEYS = {
  all: ['navigation'] as const,
  lists: () => [...NAVIGATION_KEYS.all, 'list'] as const,
  list: (filters?: NavigationFiltersRequest) =>
    [...NAVIGATION_KEYS.lists(), filters] as const,
  details: () => [...NAVIGATION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...NAVIGATION_KEYS.details(), id] as const,
}

export const useNavigationList = (
  filters?: NavigationFiltersRequest,
  options?: Omit<UseQueryOptions<NavigationListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<NavigationListResponse, Error>({
    queryKey: NAVIGATION_KEYS.list(filters),
    queryFn: () => navigationActions.getAll(filters),
    ...options,
  })
}

export const useNavigationConfig = (
  id: string,
  options?: Omit<UseQueryOptions<NavigationConfig, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<NavigationConfig, Error>({
    queryKey: NAVIGATION_KEYS.detail(id),
    queryFn: () => navigationActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
