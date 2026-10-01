import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ModulePage from '@/components/ModulePage'
import SectionTextsForm from '@/components/SectionTextsForm'
import SectionListEditor, { type SectionListField } from '@/components/SectionListEditor'
import { useSiteModules } from '@/lib/siteModules'
import { API_ENDPOINTS } from '@/constants/api'
import { HOME_SECTIONS, HOME_TEXT_GROUPS, pickVariant } from '@/constants/siteSections'

const HOME_VIDEO_FIELDS: SectionListField[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'videoId', label: 'Video', type: 'video', help: 'Video file from the media library.' },
  { name: 'imageId', label: 'Cover image', type: 'image', help: 'Image shown before the video plays.' },
]

const DELIVERY_APP_FIELDS: SectionListField[] = [
  { name: 'name', label: 'Name', required: true, placeholder: 'Pedidos Ya' },
  { name: 'url', label: 'Link', placeholder: 'https://' },
  { name: 'iconId', label: 'Logo', type: 'image' },
]

const TAB_LABELS: Record<string, string> = {
  products: 'Products section',
  recipes: 'Recipes section',
  videos: 'Recipe videos',
  newsletter: 'Newsletter',
  brands: 'Brands section',
  newProducts: 'New products',
  quiz: 'Quiz invitation',
  social: 'Social networks and newsletter',
  delivery: 'Where to find us',
}

export default function HomeContent() {
  const { t } = useTranslation()
  const { selectedSite, isModuleEnabled } = useSiteModules()
  const sections = pickVariant(HOME_SECTIONS, selectedSite?.slug)

  const extras: Record<string, ReactNode> = {
    videos: (
      <SectionListEditor
        title={t("Videos")}
        description={t("Videos shown in the carousel, in this order.")}
        endpoint={API_ENDPOINTS.SECTION_LISTS.HOME_VIDEOS}
        fields={HOME_VIDEO_FIELDS}
        itemLabel="Video"
        addLabel="Add video"
        emptyMessage="There are no videos yet."
        itemTitle={(item) => item.title}
      />
    ),
    delivery: (
      <SectionListEditor
        title={t("Delivery apps")}
        description={t("Apps shown in the carousel, in this order.")}
        endpoint={API_ENDPOINTS.SECTION_LISTS.DELIVERY_APPS}
        fields={DELIVERY_APP_FIELDS}
        itemLabel="App"
        addLabel="Add app"
        emptyMessage="There are no apps yet."
        itemTitle={(item) => item.name}
      />
    ),
    social: isModuleEnabled('descubrenos') ? (
      <p className="text-sm text-muted-foreground rounded-lg border border-border bg-card p-4">
        {t("The Instagram posts of this block are managed in")}{' '}
        <Link to="/descubrenos" className="text-primary font-medium hover:underline">{t('nav.descubrenos')}</Link>.
      </p>
    ) : null,
  }

  const tabs = sections.map((id) => {
    const group = HOME_TEXT_GROUPS[id]
    return {
      key: id,
      label: t(TAB_LABELS[id]),
      content: (
        <div className="space-y-6">
          <SectionTextsForm title={t(group.title)} description={t(group.description)} fields={group.fields} />
          {extras[id]}
        </div>
      ),
    }
  })

  return (
    <ModulePage
      title={t("Home page")}
      description={t("Content of the home page sections.")}
      tabs={tabs}
    />
  )
}
