import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  socialMediaActions,
  type SocialMedia,
  type CreateSocialMediaRequest,
  type UpdateSocialMediaRequest,
} from '@/actions/social-media'
import { SOCIAL_MEDIA_KEYS } from '@/queries/social-media'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateSocialMedia = (
  options?: Omit<
    UseMutationOptions<SocialMedia, Error, CreateSocialMediaRequest>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<SocialMedia, Error, CreateSocialMediaRequest>({
    ...options,
    mutationFn: socialMediaActions.create,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_MEDIA_KEYS.lists() })
      toast.success('Social Media created successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to create social media'))
      options?.onError?.(...args)
    },
  })
}

export const useUpdateSocialMedia = (
  options?: Omit<
    UseMutationOptions<SocialMedia, Error, { id: string; data: UpdateSocialMediaRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()
  return useMutation<SocialMedia, Error, { id: string; data: UpdateSocialMediaRequest }>({
    ...options,
    mutationFn: ({ id, data }) => socialMediaActions.update(id, data),
    onSuccess: (...args) => {
      const [, variables] = args
      queryClient.invalidateQueries({ queryKey: SOCIAL_MEDIA_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: SOCIAL_MEDIA_KEYS.detail(variables.id) })
      toast.success('Social Media updated successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to update social media'))
      options?.onError?.(...args)
    },
  })
}

export const useDeleteSocialMedia = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    ...options,
    mutationFn: socialMediaActions.delete,
    onSuccess: (...args) => {
      const [, id] = args
      queryClient.invalidateQueries({ queryKey: SOCIAL_MEDIA_KEYS.lists() })
      queryClient.removeQueries({ queryKey: SOCIAL_MEDIA_KEYS.detail(id) })
      toast.success('Social Media deleted successfully!')
      options?.onSuccess?.(...args)
    },
    onError: (...args) => {
      toast.error(extractError(args[0], 'Failed to delete social media'))
      options?.onError?.(...args)
    },
  })
}
