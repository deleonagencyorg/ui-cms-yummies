import { useTranslation } from 'react-i18next'
import ModulePage from '@/components/ModulePage'
import SectionTextsForm from '@/components/SectionTextsForm'
import SectionListEditor, { type SectionListField } from '@/components/SectionListEditor'
import { API_ENDPOINTS } from '@/constants/api'
import { useSiteModules } from '@/lib/siteModules'
import {
  ABOUT_TEXT_GROUPS,
  ABOUT_TIMELINE_FIELDS,
  ABOUT_TIMELINE_YEAR_REQUIRED,
  pickVariant,
} from '@/constants/siteSections'

const TIMELINE_FIELD_DEFINITIONS: Record<string, SectionListField> = {
  year: { name: 'year', label: 'Year', placeholder: '1973' },
  title: { name: 'title', label: 'Title' },
  text: { name: 'text', label: 'Text', type: 'textarea' },
  imageId: { name: 'imageId', label: 'Image (desktop)', type: 'image' },
  mobileImageId: { name: 'mobileImageId', label: 'Image (mobile)', type: 'image', help: 'Optional. If empty, the desktop image is used.' },
}

const timelineFieldsCache = new Map<string, SectionListField[]>()

function timelineFields(siteSlug: string | undefined): SectionListField[] {
  const cacheKey = siteSlug ?? ''
  const cached = timelineFieldsCache.get(cacheKey)
  if (cached) return cached
  const yearRequired = pickVariant(ABOUT_TIMELINE_YEAR_REQUIRED, siteSlug)
  const fields = pickVariant(ABOUT_TIMELINE_FIELDS, siteSlug).map((name) => (
    name === 'year' ? { ...TIMELINE_FIELD_DEFINITIONS.year, required: yearRequired } : TIMELINE_FIELD_DEFINITIONS[name]
  ))
  timelineFieldsCache.set(cacheKey, fields)
  return fields
}

export default function AboutUs() {
  const { t } = useTranslation()
  const { selectedSite } = useSiteModules()
  const [header, closing] = ABOUT_TEXT_GROUPS

  return (
    <ModulePage
      title={t("About us")}
      description={t("Content of the About us page.")}
      tabs={[
        {
          key: 'header',
          label: t(header.title),
          content: <SectionTextsForm title={t(header.title)} description={t(header.description)} fields={header.fields} />,
        },
        {
          key: 'timeline',
          label: t("History timeline"),
          content: (
            <SectionListEditor
              title={t("History timeline")}
              description={t("Milestones of the history, shown from top to bottom in this order.")}
              endpoint={API_ENDPOINTS.SECTION_LISTS.ABOUT_TIMELINE}
              fields={timelineFields(selectedSite?.slug)}
              itemLabel="Milestone"
              addLabel="Add milestone"
              emptyMessage="There are no milestones yet."
              itemTitle={(item) => [item.year, item.title].filter(Boolean).join(' · ')}
            />
          ),
        },
        {
          key: 'closing',
          label: t(closing.title),
          content: <SectionTextsForm title={t(closing.title)} description={t(closing.description)} fields={closing.fields} />,
        },
      ]}
    />
  )
}
