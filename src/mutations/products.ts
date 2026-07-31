import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  productActions,
  type CreateProductRequest,
  type UpdateProductRequest,
  type ProductResponse
} from '@/actions/products'
import { PRODUCT_KEYS } from '@/queries/products'

export const useCreateProduct = (
  options?: Omit<UseMutationOptions<ProductResponse, Error, CreateProductRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<ProductResponse, Error, CreateProductRequest>({
    mutationFn: productActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
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
    mutationFn: ({ id, data }) => productActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}

export const useDeleteProduct = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: productActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() })
      queryClient.removeQueries({ queryKey: PRODUCT_KEYS.detail(variables) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}
