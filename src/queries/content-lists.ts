import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  contentListActions,
  type ContentList,
  type ContentListListResponse,
  type ContentListFiltersRequest,
} from '@/actions/content-lists'

export const CONTENT_LIST_KEYS = {
  all: ['content-lists'] as const,
  lists: () => [...CONTENT_LIST_KEYS.all, 'list'] as const,
  list: (filters?: ContentListFiltersRequest) =>
    [...CONTENT_LIST_KEYS.lists(), filters] as const,
  details: () => [...CONTENT_LIST_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CONTENT_LIST_KEYS.details(), id] as const,
}

export const useContentListList = (
  filters?: ContentListFiltersRequest,
  options?: Omit<UseQueryOptions<ContentListListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ContentListListResponse, Error>({
    queryKey: CONTENT_LIST_KEYS.list(filters),
    queryFn: () => contentListActions.getAll(filters),
    ...options,
  })
}

export const useContentListItem = (
  id: string,
  options?: Omit<UseQueryOptions<ContentList, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ContentList, Error>({
    queryKey: CONTENT_LIST_KEYS.detail(id),
    queryFn: () => contentListActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
