/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getActiveSiteId, setActiveSiteId, subscribeActiveSite } from '@/lib/activeSite'

interface SiteContextType {
  selectedSiteId: string | null
  setSelectedSiteId: (siteId: string | null) => void
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

const GLOBAL_QUERY_ROOTS = new Set([
  'sites', 'brands', 'languages', 'api-tokens', 'departments', 'jobTitles', 'profiles',
])

export function SiteProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const selectedSiteId = useSyncExternalStore(subscribeActiveSite, getActiveSiteId)

  const setSelectedSiteId = useCallback((siteId: string | null) => {
    if (siteId === getActiveSiteId()) return
    setActiveSiteId(siteId)
    queryClient.removeQueries({
      predicate: (query) => !GLOBAL_QUERY_ROOTS.has(String(query.queryKey[0])),
    })
  }, [queryClient])

  return (
    <SiteContext.Provider value={{ selectedSiteId, setSelectedSiteId }}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  const context = useContext(SiteContext)
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider')
  }
  return context
}
