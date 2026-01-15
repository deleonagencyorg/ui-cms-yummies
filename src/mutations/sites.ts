import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  siteActions,
  type SiteResponse,
  type CreateSiteRequest,
  type UpdateSiteRequest
} from '@/actions/sites'
import { SITE_KEYS } from '@/queries/sites'

export const useCreateSite = (
  options?: Omit<UseMutationOptions<SiteResponse, Error, CreateSiteRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<SiteResponse, Error, CreateSiteRequest>({
    mutationFn: siteActions.create,
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: SITE_KEYS.lists() })
      options?.onSuccess?.(data, variables, context)
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
    mutationFn: ({ id, data }) => siteActions.update(id, data),
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: SITE_KEYS.lists() })
      await queryClient.invalidateQueries({ queryKey: SITE_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context)
    },
  })
}

export const useDeleteSite = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: siteActions.delete,
    ...options,
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({ queryKey: SITE_KEYS.lists() })
      queryClient.removeQueries({ queryKey: SITE_KEYS.detail(variables) })
      options?.onSuccess?.(data, variables, context)
    },
  })
}
