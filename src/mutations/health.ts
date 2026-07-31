import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  healthActions,
  type HealthConfig,
  type UpdateHealthConfigRequest,
} from '@/actions/health'
import { HEALTH_KEYS } from '@/queries/health'

export const useUpdateHealthConfig = (
  options?: Omit<
    UseMutationOptions<HealthConfig, Error, UpdateHealthConfigRequest>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<HealthConfig, Error, UpdateHealthConfigRequest>({
    ...options,
    mutationFn: healthActions.updateConfig,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: HEALTH_KEYS.config() })
      options?.onSuccess?.(...args)
    },
  })
}
