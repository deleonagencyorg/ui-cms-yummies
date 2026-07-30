import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pageActions, type CreatePageRequest, type UpdatePageRequest } from '@/actions/pages'

interface UseCreatePageOptions {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

interface UseUpdatePageOptions {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

interface UseDeletePageOptions {
  onSuccess?: () => void
  onError?: (error: unknown) => void
}

export const useCreatePage = (options?: UseCreatePageOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePageRequest) => pageActions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      options?.onSuccess?.()
    },
    onError: options?.onError,
  })
}

export const useUpdatePage = (options?: UseUpdatePageOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageRequest }) =>
      pageActions.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      options?.onSuccess?.()
    },
    onError: options?.onError,
  })
}

export const useDeletePage = (options?: UseDeletePageOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pageActions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      options?.onSuccess?.()
    },
    onError: options?.onError,
  })
}
