import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  healthActions,
  type HealthConfig,
  type CreateHealthConfigRequest,
  type UpdateHealthConfigRequest,
} from '@/actions/health'
import { HEALTH_KEYS } from '@/queries/health'

export const useCreateHealth = (
  options?: Omit<
    UseMutationOptions<HealthConfig, Error, CreateHealthConfigRequest>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<HealthConfig, Error, CreateHealthConfigRequest>({
    ...options,
    mutationFn: healthActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: HEALTH_KEYS.lists() })
      options?.onSuccess?.(...args)
    },
  })
}

export const useUpdateHealth = (
  options?: Omit<
    UseMutationOptions<HealthConfig, Error, { id: string; data: UpdateHealthConfigRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<HealthConfig, Error, { id: string; data: UpdateHealthConfigRequest }>({
    ...options,
    mutationFn: ({ id, data }) => healthActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: HEALTH_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: HEALTH_KEYS.detail(variables.id) })
      options?.onSuccess?.(...args)
    },
  })
}

export const useDeleteHealth = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: healthActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: HEALTH_KEYS.lists() })
      queryClient.removeQueries({ queryKey: HEALTH_KEYS.detail(id) })
      options?.onSuccess?.(...args)
    },
  })
}
