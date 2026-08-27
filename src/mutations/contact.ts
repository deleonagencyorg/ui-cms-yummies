import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  contactActions,
  type ContactConfig,
  type CreateContactConfigRequest,
  type UpdateContactConfigRequest,
} from '@/actions/contact'
import { CONTACT_KEYS } from '@/queries/contact'

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
      options?.onSuccess?.(...args)
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
      options?.onSuccess?.(...args)
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
      options?.onSuccess?.(...args)
    },
  })
}
