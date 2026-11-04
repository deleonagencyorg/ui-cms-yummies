import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  departmentActions,
  type CreateDepartmentRequest,
  type UpdateDepartmentRequest,
  type DepartmentResponse
} from '@/actions/departments'
import { DEPARTMENT_KEYS } from '@/queries/departments'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateDepartment = (
  options?: Omit<UseMutationOptions<DepartmentResponse, Error, CreateDepartmentRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<DepartmentResponse, Error, CreateDepartmentRequest>({
    ...options,
    mutationFn: departmentActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() })
      toast.success('Department created successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to create department'))
      options?.onError?.(error, variables, context, mutation)
    },
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
    ...options,
    mutationFn: ({ id, data }) => departmentActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.detail(variables.id) })
      toast.success('Department updated successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to update department'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteDepartment = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: departmentActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: DEPARTMENT_KEYS.lists() })
      queryClient.removeQueries({ queryKey: DEPARTMENT_KEYS.detail(variables) })
      toast.success('Department deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete department'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
