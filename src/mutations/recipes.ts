import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  recipeActions,
  type CreateRecipeRequest,
  type UpdateRecipeRequest,
  type RecipeResponse
} from '@/actions/recipes'
import { RECIPE_KEYS } from '@/queries/recipes'

export const useCreateRecipe = (
  options?: Omit<UseMutationOptions<RecipeResponse, Error, CreateRecipeRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<RecipeResponse, Error, CreateRecipeRequest>({
    mutationFn: recipeActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.lists() })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
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
    mutationFn: ({ id, data }) => recipeActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}

export const useDeleteRecipe = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: recipeActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: RECIPE_KEYS.lists() })
      queryClient.removeQueries({ queryKey: RECIPE_KEYS.detail(variables) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}
