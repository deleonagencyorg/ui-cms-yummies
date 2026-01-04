import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  jobTitleActions,
  type JobTitleResponse,
  type JobTitleListResponse,
  type JobTitleFiltersRequest
} from '@/actions/job-titles'

export const JOB_TITLE_KEYS = {
  all: ['jobTitles'] as const,
  lists: () => [...JOB_TITLE_KEYS.all, 'list'] as const,
  list: (filters?: JobTitleFiltersRequest) => [...JOB_TITLE_KEYS.lists(), filters] as const,
  details: () => [...JOB_TITLE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...JOB_TITLE_KEYS.details(), id] as const,
}

export const useJobTitles = (
  filters?: JobTitleFiltersRequest,
  options?: Omit<UseQueryOptions<JobTitleListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<JobTitleListResponse, Error>({
    queryKey: JOB_TITLE_KEYS.list(filters),
    queryFn: () => jobTitleActions.getAll(filters),
    ...options,
  })
}

export const useJobTitle = (
  id: string,
  options?: Omit<UseQueryOptions<JobTitleResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<JobTitleResponse, Error>({
    queryKey: JOB_TITLE_KEYS.detail(id),
    queryFn: () => jobTitleActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
