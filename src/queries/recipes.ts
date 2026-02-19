import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  recipeActions,
  type RecipeResponse,
  type RecipeListResponse,
  type RecipeFiltersRequest
} from '@/actions/recipes'

export const RECIPE_KEYS = {
  all: ['recipes'] as const,
  lists: () => [...RECIPE_KEYS.all, 'list'] as const,
  list: (filters?: RecipeFiltersRequest) => [...RECIPE_KEYS.lists(), filters] as const,
  details: () => [...RECIPE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...RECIPE_KEYS.details(), id] as const,
}

export const useRecipes = (
  filters?: RecipeFiltersRequest,
  options?: Omit<UseQueryOptions<RecipeListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<RecipeListResponse, Error>({
    queryKey: RECIPE_KEYS.list(filters),
    queryFn: () => recipeActions.getAll(filters),
    ...options,
  })
}

export const useRecipe = (
  id: string,
  options?: Omit<UseQueryOptions<RecipeResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<RecipeResponse, Error>({
    queryKey: RECIPE_KEYS.detail(id),
    queryFn: () => recipeActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
