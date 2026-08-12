import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
  import {
  healthActions,
  type HealthConfig,
  type HealthListResponse,
  type HealthFiltersRequest,
} from '@/actions/health'

export const HEALTH_KEYS = {
  all: ['health'] as const,
  lists: () => [...HEALTH_KEYS.all, 'list'] as const,
  list: (filters?: HealthFiltersRequest) => [...HEALTH_KEYS.lists(), filters] as const,
  details: () => [...HEALTH_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...HEALTH_KEYS.details(), id] as const,
}

export const useHealthList = (
  filters?: HealthFiltersRequest,
  options?: Omit<UseQueryOptions<HealthListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<HealthListResponse, Error>({
    queryKey: HEALTH_KEYS.list(filters),
    queryFn: () => healthActions.getAll(filters),
    ...options,
  })
}

export const useHealth = (
  id: string,
  options?: Omit<UseQueryOptions<HealthConfig, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<HealthConfig, Error>({
    queryKey: HEALTH_KEYS.detail(id),
    queryFn: () => healthActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
