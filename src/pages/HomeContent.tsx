import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ModulePage from '@/components/ModulePage'
import SectionTextsForm from '@/components/SectionTextsForm'
import SectionListEditor, { type SectionListField } from '@/components/SectionListEditor'
import { useSiteModules } from '@/lib/siteModules'
import { API_ENDPOINTS } from '@/constants/api'
import { HOME_SECTION_OPTIONS, HOME_TEXT_GROUPS } from '@/constants/siteSections'
import { CappyBackToSchoolForm, CappyGamesForm } from '@/components/CappyHomeContent'

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

export default function HomeContent() {
  const { t } = useTranslation()
  const { selectedSite, isModuleEnabled } = useSiteModules()
  const sections = (selectedSite?.homeSections ?? []).filter((id) => HOME_SECTION_OPTIONS.some((option) => option.key === id))

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
    whereToBuy: (
      <SectionListEditor
        title={t("Where to buy")}
        description={t("Stores and apps shown in the carousel, in this order.")}
        endpoint={API_ENDPOINTS.SECTION_LISTS.DELIVERY_APPS}
        fields={DELIVERY_APP_FIELDS}
        itemLabel="Store"
        addLabel="Add store"
        emptyMessage="There are no stores yet."
        itemTitle={(item) => item.name}
      />
    ),
    games: <CappyGamesForm />,
    backToSchool: <CappyBackToSchoolForm />,
    gallery: isModuleEnabled('gallery') ? (
      <p className="text-sm text-muted-foreground rounded-lg border border-border bg-card p-4">
        {t("The images of this block are managed in")}{' '}
        <Link to="/gallery" className="text-primary font-medium hover:underline">{t('nav.gallery')}</Link>.
      </p>
    ) : null,
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
      label: t(HOME_SECTION_OPTIONS.find((option) => option.key === id)?.label ?? id),
      content: (
        <div className="space-y-6">
          {group?.fields.length ? (
            <SectionTextsForm title={t(group.title)} description={t(group.description)} fields={group.fields} />
          ) : null}
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
