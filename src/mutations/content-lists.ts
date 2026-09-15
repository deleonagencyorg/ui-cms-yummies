import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  contentListActions,
  type ContentList,
  type CreateContentListRequest,
  type UpdateContentListRequest,
} from '@/actions/content-lists'
import { CONTENT_LIST_KEYS } from '@/queries/content-lists'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateContentList = (
  options?: Omit<UseMutationOptions<ContentList, Error, CreateContentListRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<ContentList, Error, CreateContentListRequest>({
    ...options,
    mutationFn: contentListActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: CONTENT_LIST_KEYS.lists() })
      toast.success('Content Block created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create content block'))
      options?.onError?.(...args)
    },
  })
}

export const useUpdateContentList = (
  options?: Omit<
    UseMutationOptions<ContentList, Error, { id: string; data: UpdateContentListRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<ContentList, Error, { id: string; data: UpdateContentListRequest }>({
    ...options,
    mutationFn: ({ id, data }) => contentListActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: CONTENT_LIST_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: CONTENT_LIST_KEYS.detail(variables.id) })
      toast.success('Content Block updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update content block'))
      options?.onError?.(...args)
    },
  })
}

export const useDeleteContentList = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    ...options,
    mutationFn: contentListActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: CONTENT_LIST_KEYS.lists() })
      queryClient.removeQueries({ queryKey: CONTENT_LIST_KEYS.detail(id) })
      toast.success('Content Block deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete content block'))
      options?.onError?.(...args)
    },
  })
}
