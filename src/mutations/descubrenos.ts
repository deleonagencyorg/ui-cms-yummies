import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  descubrenosActions,
  type Descubrenos,
  type CreateDescubrenosRequest,
  type UpdateDescubrenosRequest,
} from '@/actions/descubrenos'
import { DESCUBRENOS_KEYS } from '@/queries/descubrenos'

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
      options?.onSuccess?.(...args)
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
      options?.onSuccess?.(...args)
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
      options?.onSuccess?.(...args)
    },
  })
}
