import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  modalActions,
  type ModalConfig,
  type ModalListResponse,
  type ModalFiltersRequest,
} from '@/actions/modals'

export const MODAL_KEYS = {
  all: ['modals'] as const,
  lists: () => [...MODAL_KEYS.all, 'list'] as const,
  list: (filters?: ModalFiltersRequest) => [...MODAL_KEYS.lists(), filters] as const,
  details: () => [...MODAL_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...MODAL_KEYS.details(), id] as const,
}

export const useModalList = (
  filters?: ModalFiltersRequest,
  options?: Omit<UseQueryOptions<ModalListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ModalListResponse, Error>({
    queryKey: MODAL_KEYS.list(filters),
    queryFn: () => modalActions.getAll(filters),
    ...options,
  })
}

export const useModalConfig = (
  id: string,
  options?: Omit<UseQueryOptions<ModalConfig, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ModalConfig, Error>({
    queryKey: MODAL_KEYS.detail(id),
    queryFn: () => modalActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
