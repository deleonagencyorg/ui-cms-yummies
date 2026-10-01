import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  zambosTruckActions,
  type ZambosTruckConfig,
  type CreateZambosTruckConfigRequest,
  type UpdateZambosTruckConfigRequest,
} from '@/actions/zambos-truck'
import { ZAMBOS_TRUCK_KEYS } from '@/queries/zambos-truck'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateZambosTruck = (
  options?: Omit<
    UseMutationOptions<ZambosTruckConfig, Error, CreateZambosTruckConfigRequest>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<ZambosTruckConfig, Error, CreateZambosTruckConfigRequest>({
    ...options,
    mutationFn: zambosTruckActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ZAMBOS_TRUCK_KEYS.lists() })
      toast.success('Zambos Truck Content created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create Zambos Truck content'))
      options?.onError?.(...args)
    },
  })
}

export const useUpdateZambosTruck = (
  options?: Omit<
    UseMutationOptions<ZambosTruckConfig, Error, { id: string; data: UpdateZambosTruckConfigRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<ZambosTruckConfig, Error, { id: string; data: UpdateZambosTruckConfigRequest }>({
    ...options,
    mutationFn: ({ id, data }) => zambosTruckActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: ZAMBOS_TRUCK_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ZAMBOS_TRUCK_KEYS.detail(variables.id) })
      toast.success('Zambos Truck Content updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update Zambos Truck content'))
      options?.onError?.(...args)
    },
  })
}

export const useDeleteZambosTruck = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: zambosTruckActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: ZAMBOS_TRUCK_KEYS.lists() })
      queryClient.removeQueries({ queryKey: ZAMBOS_TRUCK_KEYS.detail(id) })
      toast.success('Zambos Truck Content deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete Zambos Truck content'))
      options?.onError?.(...args)
    },
  })
}
