import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  brandActions,
  type CreateBrandRequest,
  type UpdateBrandRequest,
  type BrandResponse
} from '@/actions/brands'
import { BRAND_KEYS } from '@/queries/brands'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateBrand = (
  options?: Omit<UseMutationOptions<BrandResponse, Error, CreateBrandRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<BrandResponse, Error, CreateBrandRequest>({
    ...options,
    mutationFn: brandActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: BRAND_KEYS.lists() })
      toast.success('Brand created successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to create brand'))
      options?.onError?.(error, variables, context, mutation)
    },
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
    ...options,
    mutationFn: ({ id, data }) => brandActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: BRAND_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: BRAND_KEYS.detail(variables.id) })
      toast.success('Brand updated successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to update brand'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteBrand = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: brandActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: BRAND_KEYS.lists() })
      queryClient.removeQueries({ queryKey: BRAND_KEYS.detail(variables) })
      toast.success('Brand deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete brand'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
