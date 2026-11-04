import { useMutation, useQueryClient } from '@tanstack/react-query'
import { languageActions, type CreateLanguageRequest, type UpdateLanguageRequest } from '@/actions/languages'
import { toast } from 'sonner'

export const useCreateLanguage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLanguageRequest) => languageActions.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] })
      toast.success('Language created successfully!')
    },
    onError: (error: unknown) => {
      toast.error((error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to create language')
    },
  })
}

export const useUpdateLanguage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: UpdateLanguageRequest }) =>
      languageActions.update(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] })
      toast.success('Language updated successfully!')
    },
    onError: (error: unknown) => {
      toast.error((error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to update language')
    },
  })
}

export const useDeleteLanguage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (code: string) => languageActions.delete(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['languages'] })
      toast.success('Language deleted successfully!')
    },
    onError: (error: unknown) => {
      toast.error((error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to delete language')
    },
  })
}
