import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  productCategoryActions,
  type ProductCategory,
  type ProductCategoryListResponse,
  type ProductCategoryFiltersRequest,
} from '@/actions/product-categories'

export const PRODUCT_CATEGORY_KEYS = {
  all: ['product-categories'] as const,
  lists: () => [...PRODUCT_CATEGORY_KEYS.all, 'list'] as const,
  list: (filters?: ProductCategoryFiltersRequest) =>
    [...PRODUCT_CATEGORY_KEYS.lists(), filters] as const,
  details: () => [...PRODUCT_CATEGORY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCT_CATEGORY_KEYS.details(), id] as const,
}

export const useProductCategoryList = (
  filters?: ProductCategoryFiltersRequest,
  options?: Omit<UseQueryOptions<ProductCategoryListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ProductCategoryListResponse, Error>({
    queryKey: PRODUCT_CATEGORY_KEYS.list(filters),
    queryFn: () => productCategoryActions.getAll(filters),
    ...options,
  })
}

export const useProductCategoryItem = (
  id: string,
  options?: Omit<UseQueryOptions<ProductCategory, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ProductCategory, Error>({
    queryKey: PRODUCT_CATEGORY_KEYS.detail(id),
    queryFn: () => productCategoryActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
