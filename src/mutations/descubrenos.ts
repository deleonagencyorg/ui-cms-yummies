import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  descubrenosActions,
  type Descubrenos,
  type CreateDescubrenosRequest,
  type UpdateDescubrenosRequest,
} from '@/actions/descubrenos'
import { DESCUBRENOS_KEYS } from '@/queries/descubrenos'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateDescubrenos = (
  options?: Omit<
    UseMutationOptions<Descubrenos, Error, CreateDescubrenosRequest>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<Descubrenos, Error, CreateDescubrenosRequest>({
    ...options,
    mutationFn: descubrenosActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: DESCUBRENOS_KEYS.lists() })
      toast.success('Descúbrenos created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create Descúbrenos'))
      options?.onError?.(...args)
    },
  })
}

export const useUpdateDescubrenos = (
  options?: Omit<
    UseMutationOptions<Descubrenos, Error, { id: string; data: UpdateDescubrenosRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<Descubrenos, Error, { id: string; data: UpdateDescubrenosRequest }>({
    ...options,
    mutationFn: ({ id, data }) => descubrenosActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: DESCUBRENOS_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: DESCUBRENOS_KEYS.detail(variables.id) })
      toast.success('Descúbrenos updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update Descúbrenos'))
      options?.onError?.(...args)
    },
  })
}

export const useDeleteDescubrenos = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: descubrenosActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: DESCUBRENOS_KEYS.lists() })
      queryClient.removeQueries({ queryKey: DESCUBRENOS_KEYS.detail(id) })
      toast.success('Descúbrenos deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete Descúbrenos'))
      options?.onError?.(...args)
    },
  })
}
