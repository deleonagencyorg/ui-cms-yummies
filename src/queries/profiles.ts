import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  profileActions,
  type ProfileResponse,
  type ProfileListResponse,
  type ProfileFiltersRequest
} from '@/actions/profiles'

export const PROFILE_KEYS = {
  all: ['profiles'] as const,
  lists: () => [...PROFILE_KEYS.all, 'list'] as const,
  list: (filters?: ProfileFiltersRequest) => [...PROFILE_KEYS.lists(), filters] as const,
  details: () => [...PROFILE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PROFILE_KEYS.details(), id] as const,
}

export const useProfiles = (
  filters?: ProfileFiltersRequest,
  options?: Omit<UseQueryOptions<ProfileListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ProfileListResponse, Error>({
    queryKey: PROFILE_KEYS.list(filters),
    queryFn: () => profileActions.getAll(filters),
    ...options,
  })
}

export const useProfile = (
  id: string,
  options?: Omit<UseQueryOptions<ProfileResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ProfileResponse, Error>({
    queryKey: PROFILE_KEYS.detail(id),
    queryFn: () => profileActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
