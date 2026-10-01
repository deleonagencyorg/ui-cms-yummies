import { useCallback } from 'react'
import { useSite } from '@/contexts/SiteContext'
import { useSites } from '@/queries/sites'
import { PATH_MODULES, type SiteModuleKey } from '@/constants/siteModules'

export function useSiteModules() {
  const { selectedSiteId } = useSite()
  const { data: sitesData, isLoading } = useSites({ page: 1, pageSize: 100 })
  const selectedSite = sitesData?.data.find((site) => site.id === selectedSiteId) ?? null
  const enabledModules = selectedSite?.enabledModules

  const isModuleEnabled = useCallback(
    (module: SiteModuleKey) => !enabledModules || enabledModules.includes(module),
    [enabledModules]
  )

  const isPathEnabled = useCallback(
    (path: string) => {
      const modules = PATH_MODULES[path]
      if (!modules) return true
      return modules.some((module) => isModuleEnabled(module))
    },
    [isModuleEnabled]
  )

  return { selectedSite, isLoading, isModuleEnabled, isPathEnabled }
}
