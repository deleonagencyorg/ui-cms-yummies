import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  recipeActions,
  type CreateRecipeRequest,
  type UpdateRecipeRequest,
  type RecipeResponse
} from '@/actions/recipes'
import { RECIPE_KEYS } from '@/queries/recipes'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateRecipe = (
  options?: Omit<UseMutationOptions<RecipeResponse, Error, CreateRecipeRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<RecipeResponse, Error, CreateRecipeRequest>({
    ...options,
    mutationFn: recipeActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.lists() })
      toast.success('Recipe created successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to create recipe'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useUpdateRecipe = (
  options?: Omit<
    UseMutationOptions<RecipeResponse, Error, { id: string; data: UpdateRecipeRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<RecipeResponse, Error, { id: string; data: UpdateRecipeRequest }>({
    ...options,
    mutationFn: ({ id, data }) => recipeActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.detail(variables.id) })
      toast.success('Recipe updated successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to update recipe'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteRecipe = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: recipeActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.lists() })
      queryClient.removeQueries({ queryKey: RECIPE_KEYS.detail(variables) })
      toast.success('Recipe deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete recipe'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
