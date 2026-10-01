import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { pageActions, type CreatePageRequest, type UpdatePageRequest } from '@/actions/pages'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

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
      toast.success('Page created successfully!')
      options?.onSuccess?.()
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to create page'))
      options?.onError?.(error)
    },
  })
}

export const useUpdatePage = (options?: UseUpdatePageOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePageRequest }) =>
      pageActions.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      toast.success('Page updated successfully!')
      options?.onSuccess?.()
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to update page'))
      options?.onError?.(error)
    },
  })
}

export const useDeletePage = (options?: UseDeletePageOptions) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => pageActions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] })
      toast.success('Page deleted successfully!')
      options?.onSuccess?.()
    },
    onError: (error: unknown) => {
      toast.error(extractError(error, 'Failed to delete page'))
      options?.onError?.(error)
    },
  })
}
