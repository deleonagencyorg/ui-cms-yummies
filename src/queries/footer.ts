import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  footerActions,
  type FooterConfig,
  type FooterListResponse,
  type FooterFiltersRequest,
} from '@/actions/footer'

export const FOOTER_KEYS = {
  all: ['footer'] as const,
  lists: () => [...FOOTER_KEYS.all, 'list'] as const,
  list: (filters?: FooterFiltersRequest) =>
    [...FOOTER_KEYS.lists(), filters] as const,
  details: () => [...FOOTER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FOOTER_KEYS.details(), id] as const,
}

export const useFooterList = (
  filters?: FooterFiltersRequest,
  options?: Omit<UseQueryOptions<FooterListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<FooterListResponse, Error>({
    queryKey: FOOTER_KEYS.list(filters),
    queryFn: () => footerActions.getAll(filters),
    ...options,
  })
}

export const useFooter = (
  id: string,
  options?: Omit<UseQueryOptions<FooterConfig, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<FooterConfig, Error>({
    queryKey: FOOTER_KEYS.detail(id),
    queryFn: () => footerActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
