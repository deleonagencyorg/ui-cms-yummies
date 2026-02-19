import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  productActions,
  type ProductResponse,
  type ProductListResponse,
  type ProductFiltersRequest
} from '@/actions/products'

export const PRODUCT_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_KEYS.all, 'list'] as const,
  list: (filters?: ProductFiltersRequest) => [...PRODUCT_KEYS.lists(), filters] as const,
  details: () => [...PRODUCT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
}

export const useProducts = (
  filters?: ProductFiltersRequest,
  options?: Omit<UseQueryOptions<ProductListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ProductListResponse, Error>({
    queryKey: PRODUCT_KEYS.list(filters),
    queryFn: () => productActions.getAll(filters),
    ...options,
  })
}

export const useProduct = (
  id: string,
  options?: Omit<UseQueryOptions<ProductResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ProductResponse, Error>({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: () => productActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
