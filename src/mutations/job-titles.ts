import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  jobTitleActions,
  type CreateJobTitleRequest,
  type UpdateJobTitleRequest,
  type JobTitleResponse
} from '@/actions/job-titles'
import { JOB_TITLE_KEYS } from '@/queries/job-titles'

function extractError(error: unknown, fallback: string): string {
  return (error as { response?: { data?: { error?: string } } }).response?.data?.error || fallback
}

export const useCreateJobTitle = (
  options?: Omit<UseMutationOptions<JobTitleResponse, Error, CreateJobTitleRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<JobTitleResponse, Error, CreateJobTitleRequest>({
    ...options,
    mutationFn: jobTitleActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: JOB_TITLE_KEYS.lists() })
      toast.success('Job Title created successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to create job title'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useUpdateJobTitle = (
  options?: Omit<
    UseMutationOptions<JobTitleResponse, Error, { id: string; data: UpdateJobTitleRequest }>,
    'mutationFn'
  >
) => {
  const queryClient = useQueryClient()

  return useMutation<JobTitleResponse, Error, { id: string; data: UpdateJobTitleRequest }>({
    ...options,
    mutationFn: ({ id, data }) => jobTitleActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: JOB_TITLE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: JOB_TITLE_KEYS.detail(variables.id) })
      toast.success('Job Title updated successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to update job title'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}

export const useDeleteJobTitle = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    ...options,
    mutationFn: jobTitleActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: JOB_TITLE_KEYS.lists() })
      queryClient.removeQueries({ queryKey: JOB_TITLE_KEYS.detail(variables) })
      toast.success('Job Title deleted successfully!')
      options?.onSuccess?.(data, variables, context, mutation)
    },
    onError: (error, variables, context, mutation) => {
      toast.error(extractError(error, 'Failed to delete job title'))
      options?.onError?.(error, variables, context, mutation)
    },
  })
}
