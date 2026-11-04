import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  profileActions,
  type CreateProfileRequest,
  type UpdateProfileRequest,
  type ProfileResponse
} from '@/actions/profiles'
import { PROFILE_KEYS } from '@/queries/profiles'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateProfile = (
  options?: Omit<UseMutationOptions<ProfileResponse, Error, CreateProfileRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<ProfileResponse, Error, CreateProfileRequest>({
    ...options,
    mutationFn: profileActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.lists() })
      toast.success('Profile created successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to create profile'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useUpdateProfile = (
  options?: Omit<
    UseMutationOptions<ProfileResponse, Error, { id: string; data: UpdateProfileRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<ProfileResponse, Error, { id: string; data: UpdateProfileRequest }>({
    ...options,
    mutationFn: ({ id, data }) => profileActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.detail(variables.id) })
      toast.success('Profile updated successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to update profile'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteProfile = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: profileActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.lists() })
      queryClient.removeQueries({ queryKey: PROFILE_KEYS.detail(variables) })
      toast.success('Profile deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete profile'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
