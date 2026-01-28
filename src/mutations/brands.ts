import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  brandActions,
  type CreateBrandRequest,
  type UpdateBrandRequest,
  type BrandResponse
} from '@/actions/brands'
import { BRAND_KEYS } from '@/queries/brands'

export const useCreateBrand = (
  options?: Omit<UseMutationOptions<BrandResponse, Error, CreateBrandRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<BrandResponse, Error, CreateBrandRequest>({
    mutationFn: brandActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: BRAND_KEYS.lists() })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}

export const useUpdateBrand = (
  options?: Omit<
    UseMutationOptions<BrandResponse, Error, { id: string; data: UpdateBrandRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<BrandResponse, Error, { id: string; data: UpdateBrandRequest }>({
    mutationFn: ({ id, data }) => brandActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: BRAND_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: BRAND_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}

export const useDeleteBrand = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: brandActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: BRAND_KEYS.lists() })
      queryClient.removeQueries({ queryKey: BRAND_KEYS.detail(variables) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}
