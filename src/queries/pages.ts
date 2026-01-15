import { useQuery } from '@tanstack/react-query'
import { pageActions, type PageFiltersRequest } from '@/actions/pages'

export const usePages = (filters?: PageFiltersRequest) => {
  return useQuery({
    queryKey: ['pages', filters],
    queryFn: () => pageActions.getAll(filters),
  })
}

export const usePage = (id: string) => {
  return useQuery({
    queryKey: ['pages', id],
    queryFn: () => pageActions.getById(id),
    enabled: !!id,
  })
}
