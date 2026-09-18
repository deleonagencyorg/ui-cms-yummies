import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  zambosTruckActions,
  type ZambosTruckConfig,
  type ZambosTruckListResponse,
  type ZambosTruckFiltersRequest,
} from '@/actions/zambos-truck'

export const ZAMBOS_TRUCK_KEYS = {
  all: ['zambos-truck'] as const,
  lists: () => [...ZAMBOS_TRUCK_KEYS.all, 'list'] as const,
  list: (filters?: ZambosTruckFiltersRequest) => [...ZAMBOS_TRUCK_KEYS.lists(), filters] as const,
  details: () => [...ZAMBOS_TRUCK_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ZAMBOS_TRUCK_KEYS.details(), id] as const,
}

export const useZambosTruckList = (
  filters?: ZambosTruckFiltersRequest,
  options?: Omit<UseQueryOptions<ZambosTruckListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ZambosTruckListResponse, Error>({
    queryKey: ZAMBOS_TRUCK_KEYS.list(filters),
    queryFn: () => zambosTruckActions.getAll(filters),
    ...options,
  })
}

export const useZambosTruck = (
  id: string,
  options?: Omit<UseQueryOptions<ZambosTruckConfig, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ZambosTruckConfig, Error>({
    queryKey: ZAMBOS_TRUCK_KEYS.detail(id),
    queryFn: () => zambosTruckActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
