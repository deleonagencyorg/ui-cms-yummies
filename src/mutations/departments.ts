import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  departmentActions,
  type CreateDepartmentRequest,
  type UpdateDepartmentRequest,
  type DepartmentResponse
} from '@/actions/departments'
import { DEPARTMENT_KEYS } from '@/queries/departments'

export const useCreateDepartment = (
  options?: Omit<UseMutationOptions<DepartmentResponse, Error, CreateDepartmentRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<DepartmentResponse, Error, CreateDepartmentRequest>({
    mutationFn: departmentActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}

export const useUpdateDepartment = (
  options?: Omit<
    UseMutationOptions<DepartmentResponse, Error, { id: string; data: UpdateDepartmentRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<DepartmentResponse, Error, { id: string; data: UpdateDepartmentRequest }>({
    mutationFn: ({ id, data }) => departmentActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}

export const useDeleteDepartment = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: departmentActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() })
      queryClient.removeQueries({ queryKey: DEPARTMENT_KEYS.detail(variables) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}
