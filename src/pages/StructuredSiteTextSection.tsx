import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import TextField from '@/components/TextField'
import { useSite } from '@/contexts/SiteContext'
import { useLanguages } from '@/queries/languages'
import { useSiteTextList } from '@/queries/site-texts'
import { useCreateSiteText, useUpdateSiteText } from '@/mutations/site-texts'
import type { SiteText } from '@/actions/site-texts'

export interface StructuredTextField {
  key: string
  label: string
  help?: string
  textarea?: boolean
}

interface Props {
  title: string
  description: string
  prefix: string
  fields: StructuredTextField[]
}

export function StructuredSiteTextSection({ title, description, prefix, fields }: Props) {
  const { t } = useTranslation()
  const { selectedSiteId } = useSite()
  const { data: languagesData } = useLanguages({ page: 1, pageSize: 100, isActive: true })
  const languages = languagesData?.data ?? []
  const [languageCode, setLanguageCode] = useState('')
  const [values, setValues] = useState<Record<string, string>>({})
  const [records, setRecords] = useState<Record<string, SiteText>>({})
  const { data, isLoading, error } = useSiteTextList({
    page: 1,
    pageSize: 100,
    key: prefix,
    languageCode: languageCode || undefined,
    siteId: selectedSiteId || undefined,
  })
  const createMutation = useCreateSiteText()
  const updateMutation = useUpdateSiteText()

  useEffect(() => {
    if (!languageCode && languages.length > 0) setLanguageCode(languages[0].code)
  }, [languageCode, languages])

  useEffect(() => {
    const nextValues: Record<string, string> = {}
    const nextRecords: Record<string, SiteText> = {}
    for (const item of data?.data ?? []) {
      nextValues[item.key] = item.value ?? ''
      nextRecords[item.key] = item
    }
    setValues(nextValues)
    setRecords(nextRecords)
  }, [data])

  const displayFields = useMemo(
    () => fields.map((field) => ({ ...field, fullKey: `${prefix}.${field.key}` })),
    [fields, prefix]
  )

  const saveField = async (field: (typeof displayFields)[number]) => {
    if (!selectedSiteId || !languageCode) return
    const value = values[field.fullKey] ?? ''
    const existing = records[field.fullKey]
    if (existing) {
      await updateMutation.mutateAsync({ id: existing.id, data: { value } })
    } else {
      await createMutation.mutateAsync({
        siteId: selectedSiteId,
        languageCode,
        key: field.fullKey,
        value,
      })
    }
  }

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-card-foreground">{title}</h2>
        <p className="text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="max-w-xs">
        <label className="block text-sm font-medium text-card-foreground mb-2">
          {t('siteSettingsEditor.fields.language')}
        </label>
        <select
          value={languageCode}
          onChange={(event) => setLanguageCode(event.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg"
        >
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name} ({language.nativeName})
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">{t('siteSettingsEditor.fields.loading')}</p>
      ) : error ? (
        <p className="text-red-500">{t('siteSettingsEditor.fields.loadError')}</p>
      ) : (
        <div className="space-y-5">
          {displayFields.map((field) => (
            <div key={field.fullKey} className="rounded-lg border border-border p-4">
              <TextField
                label={field.label}
                value={values[field.fullKey] ?? ''}
                onChange={(value) => setValues((current) => ({ ...current, [field.fullKey]: value }))}
                placeholder={field.help}
                textarea={field.textarea}
                rows={field.textarea ? 4 : undefined}
              />
              {field.help && <p className="text-xs text-muted-foreground mt-1">{field.help}</p>}
              <button
                type="button"
                onClick={() => void saveField(field)}
                disabled={!selectedSiteId || !languageCode || createMutation.isPending || updateMutation.isPending}
                className="mt-3 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
              >
                {t('siteSettingsEditor.fields.save')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
