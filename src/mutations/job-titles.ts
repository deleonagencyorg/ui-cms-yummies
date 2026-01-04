import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  jobTitleActions,
  type CreateJobTitleRequest,
  type UpdateJobTitleRequest,
  type JobTitleResponse
} from '@/actions/job-titles'
import { JOB_TITLE_KEYS } from '@/queries/job-titles'

export const useCreateJobTitle = (
  options?: Omit<UseMutationOptions<JobTitleResponse, Error, CreateJobTitleRequest>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<JobTitleResponse, Error, CreateJobTitleRequest>({
    mutationFn: jobTitleActions.create,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: JOB_TITLE_KEYS.lists() })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
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
    mutationFn: ({ id, data }) => jobTitleActions.update(id, data),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: JOB_TITLE_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: JOB_TITLE_KEYS.detail(variables.id) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}

export const useDeleteJobTitle = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: jobTitleActions.delete,
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: JOB_TITLE_KEYS.lists() })
      queryClient.removeQueries({ queryKey: JOB_TITLE_KEYS.detail(variables) })
      options?.onSuccess?.(data, variables, context, mutation)
    },
    ...options,
  })
}
