import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  siteTextActions,
  type SiteText,
  type CreateSiteTextRequest,
  type UpdateSiteTextRequest,
} from '@/actions/site-texts'
import { SITE_TEXT_KEYS } from '@/queries/site-texts'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateSiteText = (
  options?: Omit<UseMutationOptions<SiteText, Error, CreateSiteTextRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<SiteText, Error, CreateSiteTextRequest>({
    ...options,
    mutationFn: siteTextActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SITE_TEXT_KEYS.lists() })
      toast.success('Site Text created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create site text'))
      options?.onError?.(...args)
    },
  })
}

export const useUpdateSiteText = (
  options?: Omit<
    UseMutationOptions<SiteText, Error, { id: string; data: UpdateSiteTextRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<SiteText, Error, { id: string; data: UpdateSiteTextRequest }>({
    ...options,
    mutationFn: ({ id, data }) => siteTextActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: SITE_TEXT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: SITE_TEXT_KEYS.detail(variables.id) })
      toast.success('Site Text updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update site text'))
      options?.onError?.(...args)
    },
  })
}

export const useDeleteSiteText = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    ...options,
    mutationFn: siteTextActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: SITE_TEXT_KEYS.lists() })
      queryClient.removeQueries({ queryKey: SITE_TEXT_KEYS.detail(id) })
      toast.success('Site Text deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete site text'))
      options?.onError?.(...args)
    },
  })
}
