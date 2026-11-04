import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  galleryActions,
  type GalleryImage,
  type CreateGalleryImageRequest,
  type UpdateGalleryImageRequest,
} from '@/actions/gallery'
import { GALLERY_KEYS } from '@/queries/gallery'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateGalleryImage = (
  options?: Omit<UseMutationOptions<GalleryImage, Error, CreateGalleryImageRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<GalleryImage, Error, CreateGalleryImageRequest>({
    ...options,
    mutationFn: galleryActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: GALLERY_KEYS.lists() })
      toast.success('Gallery image created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create gallery image'))
      options?.onError?.(...args)
    },
  })
}

export const useUpdateGalleryImage = (
  options?: Omit<
    UseMutationOptions<GalleryImage, Error, { id: string; data: UpdateGalleryImageRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<GalleryImage, Error, { id: string; data: UpdateGalleryImageRequest }>({
    ...options,
    mutationFn: ({ id, data }) => galleryActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: GALLERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: GALLERY_KEYS.detail(variables.id) })
      toast.success('Gallery image updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update gallery image'))
      options?.onError?.(...args)
    },
  })
}

export const useDeleteGalleryImage = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    ...options,
    mutationFn: galleryActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: GALLERY_KEYS.lists() })
      queryClient.removeQueries({ queryKey: GALLERY_KEYS.detail(id) })
      toast.success('Gallery image deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete gallery image'))
      options?.onError?.(...args)
    },
  })
}
