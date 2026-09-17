import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '@/components/Layout'
import Tabs from '@/components/Tabs'
import { FooterPageContent } from './Footer'
import { NavigationPageContent } from './Navigation'
import { SocialMediaContent } from './SocialMedia'
import { TopMessagesContent } from './TopMessages'
import { ContactPageContent } from './Contact'
import { SiteTextsContent } from './SiteTexts'

const TAB_KEYS = [
  'footer',
  'navigation',
  'social-media',
  'top-messages',
  'contact',
  'site-texts',
] as const

type TabKey = (typeof TAB_KEYS)[number]

function isTabKey(value: string | null): value is TabKey {
  return !!value && (TAB_KEYS as readonly string[]).includes(value)
}

export default function SiteSettings() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeKey: TabKey = isTabKey(tabParam) ? tabParam : 'footer'

  const tabs = [
    { key: 'footer', label: t('nav.footer'), content: <FooterPageContent /> },
    { key: 'navigation', label: t('nav.navigation'), content: <NavigationPageContent /> },
    { key: 'social-media', label: t('nav.socialMedia'), content: <SocialMediaContent /> },
    { key: 'top-messages', label: t('nav.topMessages'), content: <TopMessagesContent /> },
    { key: 'contact', label: t('nav.contact'), content: <ContactPageContent /> },
    { key: 'site-texts', label: t('nav.siteContent'), content: <SiteTextsContent /> },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">{t('nav.siteSettings')}</h2>
          <p className="text-muted-foreground mt-1">{t('siteSettings.description')}</p>
        </div>

        <Tabs
          tabs={tabs}
          activeKey={activeKey}
          onChange={(key) => setSearchParams({ tab: key })}
        />
      </div>
    </Layout>
  )
}
