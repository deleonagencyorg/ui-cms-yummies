import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  socialMediaActions,
  type SocialMedia,
  type SocialMediaListResponse,
  type SocialMediaFiltersRequest,
} from '@/actions/social-media'

export const SOCIAL_MEDIA_KEYS = {
  all: ['social-media'] as const,
  lists: () => [...SOCIAL_MEDIA_KEYS.all, 'list'] as const,
  list: (filters?: SocialMediaFiltersRequest) =>
    [...SOCIAL_MEDIA_KEYS.lists(), filters] as const,
  details: () => [...SOCIAL_MEDIA_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SOCIAL_MEDIA_KEYS.details(), id] as const,
}

export const useSocialMediaList = (
  filters?: SocialMediaFiltersRequest,
  options?: Omit<UseQueryOptions<SocialMediaListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SocialMediaListResponse, Error>({
    queryKey: SOCIAL_MEDIA_KEYS.list(filters),
    queryFn: () => socialMediaActions.getAll(filters),
    ...options,
  })
}

export const useSocialMediaItem = (
  id: string,
  options?: Omit<UseQueryOptions<SocialMedia, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<SocialMedia, Error>({
    queryKey: SOCIAL_MEDIA_KEYS.detail(id),
    queryFn: () => socialMediaActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
