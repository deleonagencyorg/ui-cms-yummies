import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { healthActions, type HealthConfig } from '@/actions/health'

export const HEALTH_KEYS = {
  all: ['health'] as const,
  config: () => [...HEALTH_KEYS.all, 'config'] as const,
}

export const useHealthConfig = (
  options?: Omit<UseQueryOptions<HealthConfig, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<HealthConfig, Error>({
    queryKey: HEALTH_KEYS.config(),
    queryFn: healthActions.getConfig,
    ...options,
  })
}
