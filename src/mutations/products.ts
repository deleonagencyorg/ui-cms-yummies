import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  productActions,
  type CreateProductRequest,
  type UpdateProductRequest,
  type ProductResponse
} from '@/actions/products'
import { PRODUCT_KEYS } from '@/queries/products'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateProduct = (
  options?: Omit<UseMutationOptions<ProductResponse, Error, CreateProductRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<ProductResponse, Error, CreateProductRequest>({
    ...options,
    mutationFn: productActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() })
      toast.success('Product created successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to create product'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useUpdateProduct = (
  options?: Omit<
    UseMutationOptions<ProductResponse, Error, { id: string; data: UpdateProductRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<ProductResponse, Error, { id: string; data: UpdateProductRequest }>({
    ...options,
    mutationFn: ({ id, data }) => productActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(variables.id) })
      toast.success('Product updated successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to update product'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteProduct = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: productActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() })
      queryClient.removeQueries({ queryKey: PRODUCT_KEYS.detail(variables) })
      toast.success('Product deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete product'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
