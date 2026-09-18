import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  footerActions,
  type FooterConfig,
  type CreateFooterConfigRequest,
  type UpdateFooterConfigRequest,
} from '@/actions/footer'
import { FOOTER_KEYS } from '@/queries/footer'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateFooter = (
  options?: Omit<
    UseMutationOptions<FooterConfig, Error, CreateFooterConfigRequest>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<FooterConfig, Error, CreateFooterConfigRequest>({
    ...options,
    mutationFn: footerActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: FOOTER_KEYS.lists() })
      toast.success('Footer created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create footer'))
      options?.onError?.(...args)
    },
  })
}

export const useUpdateFooter = (
  options?: Omit<
    UseMutationOptions<FooterConfig, Error, { id: string; data: UpdateFooterConfigRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<FooterConfig, Error, { id: string; data: UpdateFooterConfigRequest }>({
    ...options,
    mutationFn: ({ id, data }) => footerActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: FOOTER_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: FOOTER_KEYS.detail(variables.id) })
      toast.success('Footer updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update footer'))
      options?.onError?.(...args)
    },
  })
}

export const useDeleteFooter = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    ...options,
    mutationFn: footerActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: FOOTER_KEYS.lists() })
      queryClient.removeQueries({ queryKey: FOOTER_KEYS.detail(id) })
      toast.success('Footer deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete footer'))
      options?.onError?.(...args)
    },
  })
}
