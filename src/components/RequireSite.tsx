import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '@/components/Layout'
import { useSite } from '@/contexts/SiteContext'
import { useSiteModules } from '@/lib/siteModules'
import type { SiteModuleKey } from '@/constants/siteModules'

interface RequireSiteProps {
  children: ReactNode
  modules?: SiteModuleKey[]
}

export default function RequireSite({ children, modules }: RequireSiteProps) {
  const { selectedSiteId } = useSite()
  const { selectedSite, isModuleEnabled } = useSiteModules()
  const { t } = useTranslation()

  if (!selectedSiteId) {
    return (
      <Layout>
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <h2 className="text-xl font-semibold">{t('nav.selectSite')}</h2>
          <p className="mt-2 text-muted-foreground">{t('nav.selectSiteFirst')}</p>
        </div>
      </Layout>
    )
  }

  if (modules && modules.length > 0 && !modules.some((module) => isModuleEnabled(module))) {
    return (
      <Layout>
        <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
          <h2 className="text-xl font-semibold">{t("This module is not active for this site")}</h2>
          <p className="mt-2 text-muted-foreground">
            {t("{{site}} does not use this module. You can activate it from Sites if the site needs it.", { site: selectedSite?.name ?? '' })}
          </p>
          <Link
            to="/sites"
            className="inline-flex mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t("Go to Sites")}
          </Link>
        </div>
      </Layout>
    )
  }

  return <Fragment key={selectedSiteId}>{children}</Fragment>
}
