import { useQuery } from '@tanstack/react-query'
import { languageActions, type LanguageFiltersRequest } from '@/actions/languages'

export const useLanguages = (filters?: LanguageFiltersRequest) => {
  return useQuery({
    queryKey: ['languages', filters],
    queryFn: () => languageActions.getAll(filters),
  })
}

export const useLanguage = (code: string) => {
  return useQuery({
    queryKey: ['languages', code],
    queryFn: () => languageActions.getByCode(code),
    enabled: !!code,
  })
}
