import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import TextField from '@/components/TextField'
import MediaPicker from '@/components/MediaPicker'
import { ModuleSection } from '@/components/ModulePage'
import { useSite } from '@/contexts/SiteContext'
import { useContentLanguage } from '@/lib/contentLanguage'
import { useSiteTextList, SITE_TEXT_KEYS } from '@/queries/site-texts'
import { siteTextActions, type SiteText } from '@/actions/site-texts'
import type { SectionTextField } from '@/constants/siteSections'

interface SectionTextsFormProps {
  title: string
  description?: string
  fields: SectionTextField[]
}

function commonPrefix(keys: string[]): string {
  if (keys.length === 0) return ''
  const parts = keys.map((key) => key.split('.'))
  const first = parts[0]
  const shared: string[] = []
  for (let i = 0; i < first.length - 1; i++) {
    if (parts.every((segments) => segments[i] === first[i])) shared.push(first[i])
    else break
  }
  return shared.length ? shared.join('.') + '.' : ''
}

export default function SectionTextsForm({ title, description, fields }: SectionTextsFormProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { selectedSiteId } = useSite()
  const languageCode = useContentLanguage()
  const fieldKeys = fields.map((field) => field.key).join('|')
  const prefix = useMemo(() => commonPrefix(fieldKeys.split('|')), [fieldKeys])
  const { data, isLoading, error } = useSiteTextList(
    { page: 1, pageSize: 500, key: prefix || undefined, languageCode, siteId: selectedSiteId || undefined },
    { enabled: !!selectedSiteId && !!languageCode }
  )
  const records = useMemo(() => {
    const map: Record<string, SiteText> = {}
    for (const item of data?.data ?? []) map[item.key] = item
    return map
  }, [data])
  const [values, setValues] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [pickerKey, setPickerKey] = useState<string | null>(null)

  useEffect(() => {
    const next: Record<string, string> = {}
    for (const key of fieldKeys.split('|')) next[key] = records[key]?.value ?? ''
    setValues(next)
  }, [records, fieldKeys])

  const changedFields = fields.filter((field) => (values[field.key] ?? '') !== (records[field.key]?.value ?? ''))

  const save = async () => {
    if (!selectedSiteId || !languageCode || changedFields.length === 0) return
    setIsSaving(true)
    try {
      for (const field of changedFields) {
        const value = values[field.key] ?? ''
        const existing = records[field.key]
        if (existing) {
          await siteTextActions.update(existing.id, { value })
        } else {
          await siteTextActions.create({ siteId: selectedSiteId, languageCode, key: field.key, value })
        }
      }
      await queryClient.invalidateQueries({ queryKey: SITE_TEXT_KEYS.lists() })
      toast.success(t("Changes saved"))
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error
      toast.error(message || t("Could not save the changes"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ModuleSection
      title={title}
      description={description}
      actions={
        <button
          type="button"
          onClick={() => void save()}
          disabled={isSaving || changedFields.length === 0}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? t("Saving...") : t("Save changes")}
        </button>
      }
    >
      {isLoading ? (
        <p className="text-muted-foreground">{t("Loading...")}</p>
      ) : error ? (
        <p className="text-red-500">{t("Could not load the content")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.key} className={field.textarea ? 'md:col-span-2' : undefined}>
              {field.image ? (
                <div>
                  <p className="block text-sm font-medium text-card-foreground mb-2">{t(field.label)}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-lg border border-border bg-secondary overflow-hidden flex items-center justify-center">
                      {values[field.key]
                        ? <img src={values[field.key]} alt="" className="w-full h-full object-contain" />
                        : <span className="text-xs text-muted-foreground">{t("None")}</span>}
                    </div>
                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => setPickerKey(field.key)} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-secondary">
                        {values[field.key] ? t("Change") : t("Choose")}
                      </button>
                      {values[field.key] && (
                        <button type="button" onClick={() => setValues((current) => ({ ...current, [field.key]: '' }))} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-red-600">
                          {t("Remove")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <TextField
                  label={t(field.label)}
                  value={values[field.key] ?? ''}
                  onChange={(value) => setValues((current) => ({ ...current, [field.key]: value }))}
                  textarea={field.textarea}
                  rows={field.textarea ? 4 : undefined}
                />
              )}
              {field.help && <p className="text-xs text-muted-foreground mt-1">{t(field.help)}</p>}
            </div>
          ))}
        </div>
      )}
      {pickerKey && (
        <MediaPicker
          isOpen
          onClose={() => setPickerKey(null)}
          onSelect={(media) => {
            setValues((current) => ({ ...current, [pickerKey]: media.originalUrl }))
            setPickerKey(null)
          }}
          type="image"
        />
      )}
    </ModuleSection>
  )
}
