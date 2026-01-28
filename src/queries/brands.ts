import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  brandActions,
  type BrandResponse,
  type BrandListResponse,
  type BrandFiltersRequest
} from '@/actions/brands'

export const BRAND_KEYS = {
  all: ['brands'] as const,
  lists: () => [...BRAND_KEYS.all, 'list'] as const,
  list: (filters?: BrandFiltersRequest) => [...BRAND_KEYS.lists(), filters] as const,
  details: () => [...BRAND_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...BRAND_KEYS.details(), id] as const,
}

export const useBrands = (
  filters?: BrandFiltersRequest,
  options?: Omit<UseQueryOptions<BrandListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<BrandListResponse, Error>({
    queryKey: BRAND_KEYS.list(filters),
    queryFn: () => brandActions.getAll(filters),
    ...options,
  })
}

export const useBrand = (
  id: string,
  options?: Omit<UseQueryOptions<BrandResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<BrandResponse, Error>({
    queryKey: BRAND_KEYS.detail(id),
    queryFn: () => brandActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
