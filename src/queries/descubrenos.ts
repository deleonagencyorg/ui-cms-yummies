import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  descubrenosActions,
  type Descubrenos,
  type DescubrenosListResponse,
  type DescubrenosFiltersRequest,
} from '@/actions/descubrenos'

export const DESCUBRENOS_KEYS = {
  all: ['descubrenos'] as const,
  lists: () => [...DESCUBRENOS_KEYS.all, 'list'] as const,
  list: (filters?: DescubrenosFiltersRequest) =>
    [...DESCUBRENOS_KEYS.lists(), filters] as const,
  details: () => [...DESCUBRENOS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...DESCUBRENOS_KEYS.details(), id] as const,
}

export const useDescubrenosList = (
  filters?: DescubrenosFiltersRequest,
  options?: Omit<UseQueryOptions<DescubrenosListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<DescubrenosListResponse, Error>({
    queryKey: DESCUBRENOS_KEYS.list(filters),
    queryFn: () => descubrenosActions.getAll(filters),
    ...options,
  })
}

export const useDescubrenos = (
  id: string,
  options?: Omit<UseQueryOptions<Descubrenos, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Descubrenos, Error>({
    queryKey: DESCUBRENOS_KEYS.detail(id),
    queryFn: () => descubrenosActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
