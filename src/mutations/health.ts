import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  healthActions,
  type HealthConfig,
  type CreateHealthConfigRequest,
  type UpdateHealthConfigRequest,
} from '@/actions/health'
import { HEALTH_KEYS } from '@/queries/health'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

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
      toast.success('Health Content created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create health content'))
      options?.onError?.(...args)
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
      toast.success('Health Content updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update health content'))
      options?.onError?.(...args)
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
      toast.success('Health Content deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete health content'))
      options?.onError?.(...args)
    },
  })
}
