import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  multimediaActions,
  type MultimediaResponse,
  type MultimediaListResponse,
  type MultimediaFiltersRequest
} from '@/actions/multimedia'

export const MULTIMEDIA_KEYS = {
  all: ['multimedia'] as const,
  lists: () => [...MULTIMEDIA_KEYS.all, 'list'] as const,
  list: (filters?: MultimediaFiltersRequest) => [...MULTIMEDIA_KEYS.lists(), filters] as const,
  details: () => [...MULTIMEDIA_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MULTIMEDIA_KEYS.details(), id] as const,
}

export const useMultimedia = (
  filters?: MultimediaFiltersRequest,
  options?: Omit<UseQueryOptions<MultimediaListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<MultimediaListResponse, Error>({
    queryKey: MULTIMEDIA_KEYS.list(filters),
    queryFn: () => multimediaActions.getAll(filters),
    ...options,
  })
}

export const useMultimediaById = (
  id: string,
  options?: Omit<UseQueryOptions<MultimediaResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<MultimediaResponse, Error>({
    queryKey: MULTIMEDIA_KEYS.detail(id),
    queryFn: () => multimediaActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
