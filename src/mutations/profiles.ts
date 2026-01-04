import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  profileActions,
  type CreateProfileRequest,
  type UpdateProfileRequest,
  type ProfileResponse
} from '@/actions/profiles'
import { PROFILE_KEYS } from '@/queries/profiles'

export const useCreateProfile = (
  options?: Omit<UseMutationOptions<ProfileResponse, Error, CreateProfileRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<ProfileResponse, Error, CreateProfileRequest>({
    mutationFn: profileActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.lists() })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
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
    mutationFn: ({ id, data }) => profileActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}

export const useDeleteProfile = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: profileActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEYS.lists() })
      queryClient.removeQueries({ queryKey: PROFILE_KEYS.detail(variables) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}
