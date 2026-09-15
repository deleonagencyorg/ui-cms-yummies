import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  siteTextActions,
  type SiteText,
  type SiteTextListResponse,
  type SiteTextFiltersRequest,
} from '@/actions/site-texts'

export const SITE_TEXT_KEYS = {
  all: ['site-texts'] as const,
  lists: () => [...SITE_TEXT_KEYS.all, 'list'] as const,
  list: (filters?: SiteTextFiltersRequest) => [...SITE_TEXT_KEYS.lists(), filters] as const,
  details: () => [...SITE_TEXT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SITE_TEXT_KEYS.details(), id] as const,
}

export const useSiteTextList = (
  filters?: SiteTextFiltersRequest,
  options?: Omit<UseQueryOptions<SiteTextListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SiteTextListResponse, Error>({
    queryKey: SITE_TEXT_KEYS.list(filters),
    queryFn: () => siteTextActions.getAll(filters),
    ...options,
  })
}

export const useSiteText = (
  id: string,
  options?: Omit<UseQueryOptions<SiteText, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SiteText, Error>({
    queryKey: SITE_TEXT_KEYS.detail(id),
    queryFn: () => siteTextActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
