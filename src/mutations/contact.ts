import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  contactActions,
  type ContactConfig,
  type CreateContactConfigRequest,
  type UpdateContactConfigRequest,
} from '@/actions/contact'
import { CONTACT_KEYS } from '@/queries/contact'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateContact = (
  options?: Omit<
    UseMutationOptions<ContactConfig, Error, CreateContactConfigRequest>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<ContactConfig, Error, CreateContactConfigRequest>({
    ...options,
    mutationFn: contactActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: CONTACT_KEYS.lists() })
      toast.success('Contact created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create contact'))
      options?.onError?.(...args)
    },
  })
}

export const useUpdateContact = (
  options?: Omit<
    UseMutationOptions<ContactConfig, Error, { id: string; data: UpdateContactConfigRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<ContactConfig, Error, { id: string; data: UpdateContactConfigRequest }>({
    ...options,
    mutationFn: ({ id, data }) => contactActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: CONTACT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: CONTACT_KEYS.detail(variables.id) })
      toast.success('Contact updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update contact'))
      options?.onError?.(...args)
    },
  })
}

export const useDeleteContact = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    ...options,
    mutationFn: contactActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: CONTACT_KEYS.lists() })
      queryClient.removeQueries({ queryKey: CONTACT_KEYS.detail(id) })
      toast.success('Contact deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete contact'))
      options?.onError?.(...args)
    },
  })
}
