/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'

interface SiteContextType {
  selectedSiteId: string | null
  setSelectedSiteId: (siteId: string | null) => void
}

const SiteContext = createContext<SiteContextType | undefined>(undefined)

const SELECTED_SITE_STORAGE_KEY = 'selected_site_id'

export function SiteProvider({ children }: { children: ReactNode }) {
  const [selectedSiteId, setSelectedSiteIdState] = useState<string | null>(() => {
    // Load from localStorage on init
    const stored = localStorage.getItem(SELECTED_SITE_STORAGE_KEY)
    return stored || null
  })

  const setSelectedSiteId = (siteId: string | null) => {
    setSelectedSiteIdState(siteId)
    if (siteId) {
      localStorage.setItem(SELECTED_SITE_STORAGE_KEY, siteId)
    } else {
      localStorage.removeItem(SELECTED_SITE_STORAGE_KEY)
    }
  }

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
