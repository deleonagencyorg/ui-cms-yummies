import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ModulePage, { ModuleSection } from '@/components/ModulePage'
import TextField from '@/components/TextField'
import SectionListEditor, { type SectionListField } from '@/components/SectionListEditor'
import { useSite } from '@/contexts/SiteContext'
import { useSiteModules } from '@/lib/siteModules'
import { useContentLanguage } from '@/lib/contentLanguage'
import { useFooterList } from '@/queries/footer'
import { useCreateFooter, useUpdateFooter } from '@/mutations/footer'
import type { FooterConfig } from '@/actions/footer'
import { API_ENDPOINTS } from '@/constants/api'
import {
  FOOTER_FIELD_GROUPS,
  FOOTER_FIELDS,
  FOOTER_LINK_SITES,
  FOOTER_PHONE_FIELDS,
  FOOTER_PHONE_SITES,
  pickVariant,
  type FooterTextField,
} from '@/constants/siteSections'

const PHONE_FIELD_DEFINITIONS: Record<string, SectionListField> = {
  country: { name: 'country', label: 'Country', placeholder: 'Guatemala' },
  flag: { name: 'flag', label: 'Flag', placeholder: '🇬🇹', help: 'Flag emoji shown next to the number.' },
  flagImageId: { name: 'flagImageId', label: 'Flag image', type: 'image', help: 'Small flag image shown next to the number.' },
  number: { name: 'number', label: 'Phone number', required: true, placeholder: '(+502) 2502-7050' },
}

const phoneFieldsCache = new Map<string, SectionListField[]>()

function phoneFields(siteSlug: string | undefined): SectionListField[] {
  const cacheKey = siteSlug ?? ''
  const cached = phoneFieldsCache.get(cacheKey)
  if (cached) return cached
  const fields = pickVariant(FOOTER_PHONE_FIELDS, siteSlug).map((name) => PHONE_FIELD_DEFINITIONS[name])
  phoneFieldsCache.set(cacheKey, fields)
  return fields
}

const LINK_FIELDS: SectionListField[] = [
  { name: 'label', label: 'Text', required: true, placeholder: 'Contacto' },
  { name: 'url', label: 'Link', required: true, placeholder: '/es/contacto' },
]

type FooterValues = Partial<Record<FooterTextField, string>>

function FooterTextsForm() {
  const { t } = useTranslation()
  const { selectedSiteId } = useSite()
  const { selectedSite } = useSiteModules()
  const languageCode = useContentLanguage()
  const variant = pickVariant(FOOTER_FIELDS, selectedSite?.slug)
  const groups = useMemo(
    () => FOOTER_FIELD_GROUPS
      .map((group) => ({ ...group, fields: group.fields.filter((field) => variant === 'all' || variant.includes(field.name)) }))
      .filter((group) => group.fields.length > 0),
    [variant]
  )
  const { data, isLoading, error } = useFooterList(
    { page: 1, pageSize: 10, languageCode, siteId: selectedSiteId || undefined },
    { enabled: !!selectedSiteId && !!languageCode }
  )
  const config: FooterConfig | undefined = data?.data.find((item) => item.languageCode === languageCode)

  if (isLoading) return <ModuleSection title={t("Footer texts")}><p className="text-muted-foreground">{t("Loading...")}</p></ModuleSection>
  if (error) return <ModuleSection title={t("Footer texts")}><p className="text-red-500">{t("Could not load the content")}</p></ModuleSection>

  return (
    <FooterTextsFields
      key={`${config?.id ?? 'new'}-${languageCode}-${config?.updatedAt ?? ''}`}
      config={config}
      groups={groups}
      siteId={selectedSiteId}
      languageCode={languageCode}
    />
  )
}

function initialFooterValues(config: FooterConfig | undefined): FooterValues {
  const values: FooterValues = {}
  for (const group of FOOTER_FIELD_GROUPS) {
    for (const field of group.fields) values[field.name] = (config?.[field.name] as string | undefined) ?? ''
  }
  return values
}

function FooterTextsFields({ config, groups, siteId, languageCode }: {
  config: FooterConfig | undefined
  groups: typeof FOOTER_FIELD_GROUPS
  siteId: string | null
  languageCode: string
}) {
  const { t } = useTranslation()
  const [values, setValues] = useState<FooterValues>(() => initialFooterValues(config))
  const createMutation = useCreateFooter()
  const updateMutation = useUpdateFooter()
  const isSaving = createMutation.isPending || updateMutation.isPending

  const visibleNames = groups.flatMap((group) => group.fields.map((field) => field.name))
  const isDirty = visibleNames.some((name) => (values[name] ?? '') !== ((config?.[name] as string | undefined) ?? ''))

  const save = async () => {
    if (!siteId || !languageCode) return
    const changes: FooterValues = {}
    for (const name of visibleNames) changes[name] = values[name] ?? ''
    if (config) {
      await updateMutation.mutateAsync({ id: config.id, data: changes })
    } else {
      await createMutation.mutateAsync({ siteId, languageCode, ...changes })
    }
  }

  return (
    <ModuleSection
      title={t("Footer texts")}
      description={t("Only the fields this site's footer shows are listed.")}
      actions={
        <button
          type="button"
          onClick={() => void save()}
          disabled={isSaving || !isDirty}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? t("Saving...") : t("Save changes")}
        </button>
      }
    >
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">{t(group.title)}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.fields.map((field) => (
                <div key={field.name} className={field.textarea ? 'md:col-span-2' : undefined}>
                  <TextField
                    label={t(field.label)}
                    value={values[field.name] ?? ''}
                    onChange={(value) => setValues((current) => ({ ...current, [field.name]: value }))}
                    textarea={field.textarea}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ModuleSection>
  )
}

export default function FooterPage() {
  const { t } = useTranslation()
  const { selectedSite } = useSiteModules()
  const showPhones = pickVariant(FOOTER_PHONE_SITES, selectedSite?.slug)

  const tabs = [{ key: 'texts', label: t("Footer texts"), content: <FooterTextsForm /> }]
  if (pickVariant(FOOTER_LINK_SITES, selectedSite?.slug)) {
    tabs.push({
      key: 'links',
      label: t("Footer links"),
      content: (
        <SectionListEditor
          title={t("Footer links")}
          description={t("Links listed in the footer, in this order.")}
          endpoint={API_ENDPOINTS.SECTION_LISTS.FOOTER_LINKS}
          fields={LINK_FIELDS}
          itemLabel="Link"
          addLabel="Add link"
          emptyMessage="There are no links yet."
          itemTitle={(item) => item.label}
        />
      ),
    })
  }
  if (showPhones) {
    tabs.push({
      key: 'phones',
      label: t("Phone numbers by country"),
      content: (
        <SectionListEditor
          title={t("Phone numbers by country")}
          description={t("Numbers listed in the footer, in this order.")}
          endpoint={API_ENDPOINTS.SECTION_LISTS.FOOTER_PHONES}
          fields={phoneFields(selectedSite?.slug)}
          itemLabel="Phone"
          addLabel="Add phone number"
          emptyMessage="There are no phone numbers yet."
          itemTitle={(item) => [item.flag, item.country].filter(Boolean).join(' ')}
        />
      ),
    })
  }

  return <ModulePage title={t("Footer")} description={t("Content shown at the bottom of every page.")} tabs={tabs} />
}
