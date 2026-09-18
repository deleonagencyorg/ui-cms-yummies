import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  navigationActions,
  type NavigationConfig,
  type CreateNavigationConfigRequest,
  type UpdateNavigationConfigRequest,
} from '@/actions/navigation'
import { NAVIGATION_KEYS } from '@/queries/navigation'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateNavigation = (
  options?: Omit<
    UseMutationOptions<NavigationConfig, Error, CreateNavigationConfigRequest>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<NavigationConfig, Error, CreateNavigationConfigRequest>({
    ...options,
    mutationFn: navigationActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: NAVIGATION_KEYS.lists() })
      toast.success('Navigation created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create navigation'))
      options?.onError?.(...args)
    },
  })
}

export const useUpdateNavigation = (
  options?: Omit<
    UseMutationOptions<NavigationConfig, Error, { id: string; data: UpdateNavigationConfigRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<NavigationConfig, Error, { id: string; data: UpdateNavigationConfigRequest }>({
    ...options,
    mutationFn: ({ id, data }) => navigationActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: NAVIGATION_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: NAVIGATION_KEYS.detail(variables.id) })
      toast.success('Navigation updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update navigation'))
      options?.onError?.(...args)
    },
  })
}

export const useDeleteNavigation = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    ...options,
    mutationFn: navigationActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: NAVIGATION_KEYS.lists() })
      queryClient.removeQueries({ queryKey: NAVIGATION_KEYS.detail(id) })
      toast.success('Navigation deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete navigation'))
      options?.onError?.(...args)
    },
  })
}
