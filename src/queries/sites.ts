import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  siteActions,
  type SiteResponse,
  type SiteListResponse,
  type SiteFiltersRequest
} from '@/actions/sites'

export const SITE_KEYS = {
  all: ['sites'] as const,
  lists: () => [...SITE_KEYS.all, 'list'] as const,
  list: (filters?: SiteFiltersRequest) => [...SITE_KEYS.lists(), filters] as const,
  details: () => [...SITE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SITE_KEYS.details(), id] as const,
}

export const useSites = (
  filters?: SiteFiltersRequest,
  options?: Omit<UseQueryOptions<SiteListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SiteListResponse, Error>({
    queryKey: SITE_KEYS.list(filters),
    queryFn: () => siteActions.getAll(filters),
    ...options,
  })
}

export const useSite = (
  id: string,
  options?: Omit<UseQueryOptions<SiteResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SiteResponse, Error>({
    queryKey: SITE_KEYS.detail(id),
    queryFn: () => siteActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
