import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  productCategoryActions,
  type ProductCategory,
  type CreateProductCategoryRequest,
  type UpdateProductCategoryRequest,
} from '@/actions/product-categories'
import { PRODUCT_CATEGORY_KEYS } from '@/queries/product-categories'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateProductCategory = (
  options?: Omit<
    UseMutationOptions<ProductCategory, Error, CreateProductCategoryRequest>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<ProductCategory, Error, CreateProductCategoryRequest>({
    ...options,
    mutationFn: productCategoryActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.lists() })
      toast.success('Product category created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create product category'))
      options?.onError?.(...args)
    },
  })
}

export const useUpdateProductCategory = (
  options?: Omit<
    UseMutationOptions<ProductCategory, Error, { id: string; data: UpdateProductCategoryRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<ProductCategory, Error, { id: string; data: UpdateProductCategoryRequest }>({
    ...options,
    mutationFn: ({ id, data }) => productCategoryActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.detail(variables.id) })
      toast.success('Product category updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update product category'))
      options?.onError?.(...args)
    },
  })
}

export const useDeleteProductCategory = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    ...options,
    mutationFn: productCategoryActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_KEYS.lists() })
      queryClient.removeQueries({ queryKey: PRODUCT_CATEGORY_KEYS.detail(id) })
      toast.success('Product category deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete product category'))
      options?.onError?.(...args)
    },
  })
}
