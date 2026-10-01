import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import {
  contactActions,
  type ContactConfig,
  type ContactListResponse,
  type ContactFiltersRequest,
} from '@/actions/contact'

export const CONTACT_KEYS = {
  all: ['contact'] as const,
  lists: () => [...CONTACT_KEYS.all, 'list'] as const,
  list: (filters?: ContactFiltersRequest) =>
    [...CONTACT_KEYS.lists(), filters] as const,
  details: () => [...CONTACT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CONTACT_KEYS.details(), id] as const,
}

export const useContactList = (
  filters?: ContactFiltersRequest,
  options?: Omit<UseQueryOptions<ContactListResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ContactListResponse, Error>({
    queryKey: CONTACT_KEYS.list(filters),
    queryFn: () => contactActions.getAll(filters),
    ...options,
  })
}

export const useContact = (
  id: string,
  options?: Omit<UseQueryOptions<ContactConfig, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ContactConfig, Error>({
    queryKey: CONTACT_KEYS.detail(id),
    queryFn: () => contactActions.getById(id),
    enabled: !!id,
    ...options,
  })
}
