import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  modalActions,
  type ModalConfig,
  type CreateModalRequest,
  type UpdateModalRequest,
} from '@/actions/modals'
import { MODAL_KEYS } from '@/queries/modals'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateModal = (
  options?: Omit<UseMutationOptions<ModalConfig, Error, CreateModalRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<ModalConfig, Error, CreateModalRequest>({
    ...options,
    mutationFn: modalActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: MODAL_KEYS.lists() })
      toast.success('Modal created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create modal'))
      options?.onError?.(...args)
    },
  })
}

export const useUpdateModal = (
  options?: Omit<
    UseMutationOptions<ModalConfig, Error, { id: string; data: UpdateModalRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<ModalConfig, Error, { id: string; data: UpdateModalRequest }>({
    ...options,
    mutationFn: ({ id, data }) => modalActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: MODAL_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: MODAL_KEYS.detail(variables.id) })
      toast.success('Modal updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update modal'))
      options?.onError?.(...args)
    },
  })
}

export const useDeleteModal = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    ...options,
    mutationFn: modalActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: MODAL_KEYS.lists() })
      queryClient.removeQueries({ queryKey: MODAL_KEYS.detail(id) })
      toast.success('Modal deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete modal'))
      options?.onError?.(...args)
    },
  })
}
