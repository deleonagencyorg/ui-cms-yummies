import { useEffect, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '@/components/Layout'
import Tabs, { type TabItem } from '@/components/Tabs'
import { useLanguages } from '@/queries/languages'
import { useSiteModules } from '@/lib/siteModules'
import { ContentLanguageContext } from '@/lib/contentLanguage'

interface ModulePageProps {
  title: string
  description: string
  tabs: TabItem[]
  showLanguage?: boolean
}

export default function ModulePage({ title, description, tabs, showLanguage = true }: ModulePageProps) {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { selectedSite } = useSiteModules()
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const languages = languagesData?.data ?? []
  const languageParam = searchParams.get('lang') ?? ''
  const languageCode = languages.some((language) => language.code === languageParam)
    ? languageParam
    : selectedSite?.defaultLanguageCode && languages.some((language) => language.code === selectedSite.defaultLanguageCode)
      ? selectedSite.defaultLanguageCode
      : languages[0]?.code ?? ''
  const tabParam = searchParams.get('tab') ?? ''
  const activeKey = tabs.some((tab) => tab.key === tabParam) ? tabParam : tabs[0]?.key ?? ''

  const updateParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) next.set(key, value)
    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    if (!languageParam && languageCode) {
      const next = new URLSearchParams(searchParams)
      next.set('lang', languageCode)
      setSearchParams(next, { replace: true })
    }
  }, [languageParam, languageCode, searchParams, setSearchParams])

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground">{title}</h2>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
          {showLanguage && languages.length > 1 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{t("Content language")}</p>
              <div className="inline-flex rounded-lg border border-border overflow-hidden">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => updateParams({ lang: language.code })}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      language.code === languageCode
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {language.nativeName || language.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <ContentLanguageContext.Provider value={languageCode}>
          {tabs.length === 1 ? (
            tabs[0].content
          ) : (
            <Tabs tabs={tabs} activeKey={activeKey} onChange={(key) => updateParams({ tab: key })} />
          )}
        </ContentLanguageContext.Provider>
      </div>
    </Layout>
  )
}

export function ModuleSection({ title, description, children, actions }: {
  title: string
  description?: string
  children: ReactNode
  actions?: ReactNode
}) {
  return (
    <section className="bg-card rounded-lg shadow-lg border border-border p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  )
}
