const ACTIVE_SITE_STORAGE_KEY = 'cms_active_site_id'

const listeners = new Set<() => void>()
let activeSiteId: string | null = readStoredSiteId()

function readStoredSiteId(): string | null {
  try {
    return sessionStorage.getItem(ACTIVE_SITE_STORAGE_KEY)
  } catch {
    return null
  }
}

export function getActiveSiteId(): string | null {
  return activeSiteId
}

export function subscribeActiveSite(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setActiveSiteId(siteId: string | null) {
  if (siteId === activeSiteId) return
  activeSiteId = siteId
  try {
    if (siteId) {
      sessionStorage.setItem(ACTIVE_SITE_STORAGE_KEY, siteId)
    } else {
      sessionStorage.removeItem(ACTIVE_SITE_STORAGE_KEY)
    }
  } catch {
    void 0
  }
  listeners.forEach((listener) => listener())
}
