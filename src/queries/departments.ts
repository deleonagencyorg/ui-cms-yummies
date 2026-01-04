import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  departmentActions,
  type DepartmentResponse,
  type DepartmentListResponse,
  type DepartmentFiltersRequest
} from '@/actions/departments'

export const DEPARTMENT_KEYS = {
  all: ['departments'] as const,
  lists: () => [...DEPARTMENT_KEYS.all, 'list'] as const,
  list: (filters?: DepartmentFiltersRequest) => [...DEPARTMENT_KEYS.lists(), filters] as const,
  details: () => [...DEPARTMENT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...DEPARTMENT_KEYS.details(), id] as const,
}

export const useDepartments = (
  filters?: DepartmentFiltersRequest,
  options?: Omit<UseQueryOptions<DepartmentListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<DepartmentListResponse, Error>({
    queryKey: DEPARTMENT_KEYS.list(filters),
    queryFn: () => departmentActions.getAll(filters),
    ...options,
  })
}

export const useDepartment = (
  id: string,
  options?: Omit<UseQueryOptions<DepartmentResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<DepartmentResponse, Error>({
    queryKey: DEPARTMENT_KEYS.detail(id),
    queryFn: () => departmentActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
