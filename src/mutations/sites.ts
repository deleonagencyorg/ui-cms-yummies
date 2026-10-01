import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  siteActions,
  type SiteResponse,
  type CreateSiteRequest,
  type UpdateSiteRequest
} from '@/actions/sites'
import { SITE_KEYS } from '@/queries/sites'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateSite = (
  options?: Omit<UseMutationOptions<SiteResponse, Error, CreateSiteRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<SiteResponse, Error, CreateSiteRequest>({
    ...options,
    mutationFn: siteActions.create,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: SITE_KEYS.lists() })
      toast.success('Site created successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to create site'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useUpdateSite = (
  options?: Omit<
    UseMutationOptions<SiteResponse, Error, { id: string; data: UpdateSiteRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<SiteResponse, Error, { id: string; data: UpdateSiteRequest }>({
    ...options,
    mutationFn: ({ id, data }) => siteActions.update(id, data),
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: SITE_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: SITE_KEYS.detail(variables.id) })
      toast.success('Site updated successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to update site'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteSite = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: siteActions.delete,
    onSuccess: async (data, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: SITE_KEYS.lists() })
      queryClient.removeQueries({ queryKey: SITE_KEYS.detail(variables) })
      toast.success('Site deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete site'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
