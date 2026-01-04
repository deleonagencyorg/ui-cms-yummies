import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { authActions } from '@/actions/auth'
import type { ChangePasswordRequest } from '@/types/auth.types'

export const useChangePassword = (
  options?: Omit<UseMutationOptions<void, Error, ChangePasswordRequest>, 'mutationFn'>
) => {
  return useMutation<void, Error, ChangePasswordRequest>({
    mutationFn: authActions.changePassword,
    ...options,
  })
}
