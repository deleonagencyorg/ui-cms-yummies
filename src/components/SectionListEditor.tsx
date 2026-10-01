import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import TextField from '@/components/TextField'
import MediaPicker from '@/components/MediaPicker'
import { ModuleSection } from '@/components/ModulePage'
import { useSite } from '@/contexts/SiteContext'
import { useContentLanguage } from '@/lib/contentLanguage'
import { sectionListActions, type SectionListEndpoint } from '@/actions/section-lists'
import type { MultimediaResponse } from '@/actions/multimedia'

export interface SectionListField {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'image' | 'video'
  required?: boolean
  placeholder?: string
  help?: string
}

interface SectionListEditorProps {
  title: string
  description?: string
  endpoint: SectionListEndpoint
  fields: SectionListField[]
  itemLabel: string
  addLabel: string
  emptyMessage: string
  itemTitle: (item: Record<string, string>, index: number) => string
}

type FormItem = Record<string, string> & { _key: string }

const MEDIA_RELATIONS: Record<string, string> = {
  imageId: 'image',
  mobileImageId: 'mobileImage',
  videoId: 'video',
  flagImageId: 'flagImage',
  iconId: 'icon',
}

function mediaUrl(media: MultimediaResponse | undefined): string {
  if (!media) return ''
  return media.thumbnailUrl || media.originalUrl || ''
}

function toFormItems(data: Record<string, unknown>[], fields: SectionListField[]): FormItem[] {
  return data.map((item, index) => {
    const form: FormItem = { _key: String(item.id ?? `${Date.now()}-${index}`) }
    for (const field of fields) {
      form[field.name] = item[field.name] == null ? '' : String(item[field.name])
      const relation = MEDIA_RELATIONS[field.name]
      if (relation) form[`${field.name}__preview`] = mediaUrl(item[relation] as MultimediaResponse | undefined)
    }
    return form
  })
}

function toPayload(items: FormItem[], fields: SectionListField[]) {
  return items.map((item) => {
    const payload: Record<string, string | null> = {}
    for (const field of fields) {
      const value = item[field.name] ?? ''
      payload[field.name] = MEDIA_RELATIONS[field.name] ? value || null : value
    }
    return payload
  })
}

export default function SectionListEditor({
  title,
  description,
  endpoint,
  fields,
  itemLabel,
  addLabel,
  emptyMessage,
  itemTitle,
}: SectionListEditorProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { selectedSiteId } = useSite()
  const languageCode = useContentLanguage()
  const queryKey = ['section-list', endpoint, selectedSiteId, languageCode]
  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => sectionListActions.getAll<Record<string, unknown>>(endpoint, selectedSiteId!, languageCode),
    enabled: !!selectedSiteId && !!languageCode,
  })
  const [items, setItems] = useState<FormItem[]>([])
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [picker, setPicker] = useState<{ index: number; field: SectionListField } | null>(null)

  useEffect(() => {
    if (data) {
      setItems(toFormItems(data.data, fields))
      setIsDirty(false)
    }
  }, [data, fields])

  const update = (next: FormItem[]) => {
    setItems(next)
    setIsDirty(true)
  }

  const setValue = (index: number, name: string, value: string) => {
    update(items.map((item, i) => (i === index ? { ...item, [name]: value } : item)))
  }

  const addItem = () => {
    const item: FormItem = { _key: `new-${Date.now()}` }
    for (const field of fields) item[field.name] = ''
    update([...items, item])
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const [moved] = next.splice(index, 1)
    next.splice(target, 0, moved)
    update(next)
  }

  const missingRequired = items.some((item) => fields.some((field) => field.required && !item[field.name]?.trim()))

  const save = async () => {
    if (!selectedSiteId || !languageCode) return
    if (missingRequired) {
      toast.error(t("Fill in the required fields marked with *"))
      return
    }
    setIsSaving(true)
    try {
      const response = await sectionListActions.replace(endpoint, selectedSiteId, languageCode, toPayload(items, fields))
      queryClient.setQueryData(queryKey, response)
      setItems(toFormItems(response.data as Record<string, unknown>[], fields))
      setIsDirty(false)
      toast.success(t("Changes saved"))
    } catch (err) {
      const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error
      toast.error(message || t("Could not save the changes"))
    } finally {
      setIsSaving(false)
    }
  }

  const handleMediaSelect = (media: MultimediaResponse) => {
    if (!picker) return
    const { index, field } = picker
    update(items.map((item, i) => (
      i === index ? { ...item, [field.name]: media.id, [`${field.name}__preview`]: mediaUrl(media) } : item
    )))
    setPicker(null)
  }

  return (
    <ModuleSection
      title={title}
      description={description}
      actions={
        <div className="flex items-center gap-3">
          {isDirty && <span className="text-xs text-amber-600">{t("Unsaved changes")}</span>}
          <button
            type="button"
            onClick={() => void save()}
            disabled={isSaving || !isDirty}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? t("Saving...") : t("Save changes")}
          </button>
        </div>
      }
    >
      {isLoading ? (
        <p className="text-muted-foreground">{t("Loading...")}</p>
      ) : error ? (
        <p className="text-red-500">{t("Could not load the content")}</p>
      ) : (
        <div className="space-y-4">
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border p-6 text-center">
              {t(emptyMessage)}
            </p>
          )}

          {items.map((item, index) => (
            <div key={item._key} className="rounded-lg border border-border p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-card-foreground">
                  {t(itemLabel)} {index + 1}
                  <span className="font-normal text-muted-foreground">{itemTitle(item, index) ? ` · ${itemTitle(item, index)}` : ''}</span>
                </p>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="px-2 py-1 text-sm border border-border rounded-lg disabled:opacity-40" title={t("Move up")}>↑</button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} className="px-2 py-1 text-sm border border-border rounded-lg disabled:opacity-40" title={t("Move down")}>↓</button>
                  <button type="button" onClick={() => update(items.filter((_, i) => i !== index))} className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                    {t("Remove")}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => {
                  if (field.type === 'image' || field.type === 'video') {
                    const preview = item[`${field.name}__preview`]
                    return (
                      <div key={field.name}>
                        <p className="block text-sm font-medium text-card-foreground mb-2">
                          {t(field.label)}{field.required ? ' *' : ''}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-20 rounded-lg border border-border bg-secondary overflow-hidden flex items-center justify-center">
                            {preview ? (
                              field.type === 'video' && !/\.(webp|png|jpe?g|gif|avif)(\?|$)/i.test(preview)
                                ? <span className="text-xs text-muted-foreground px-1 text-center">{t("Video selected")}</span>
                                : <img src={preview} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs text-muted-foreground">{t("None")}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <button type="button" onClick={() => setPicker({ index, field })} className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-secondary">
                              {item[field.name] ? t("Change") : t("Choose")}
                            </button>
                            {item[field.name] && (
                              <button type="button" onClick={() => update(items.map((it, i) => (i === index ? { ...it, [field.name]: '', [`${field.name}__preview`]: '' } : it)))} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-red-600">
                                {t("Remove")}
                              </button>
                            )}
                          </div>
                        </div>
                        {field.help && <p className="text-xs text-muted-foreground mt-1">{t(field.help)}</p>}
                      </div>
                    )
                  }
                  return (
                    <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : undefined}>
                      <TextField
                        label={t(field.label)}
                        value={item[field.name] ?? ''}
                        onChange={(value) => setValue(index, field.name, value)}
                        required={field.required}
                        textarea={field.type === 'textarea'}
                        rows={field.type === 'textarea' ? 3 : undefined}
                        placeholder={field.placeholder}
                      />
                      {field.help && <p className="text-xs text-muted-foreground mt-1">{t(field.help)}</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            + {t(addLabel)}
          </button>
        </div>
      )}

      {picker && (
        <MediaPicker
          isOpen
          onClose={() => setPicker(null)}
          onSelect={handleMediaSelect}
          type={picker.field.type === 'video' ? 'video' : 'image'}
          title={t(picker.field.label)}
        />
      )}
    </ModuleSection>
  )
}
