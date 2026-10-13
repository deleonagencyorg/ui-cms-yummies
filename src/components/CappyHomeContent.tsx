import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ModuleSection } from '@/components/ModulePage'
import TextField from '@/components/TextField'
import { useSite } from '@/contexts/SiteContext'
import { useContentLanguage } from '@/lib/contentLanguage'
import { useSiteTextList, SITE_TEXT_KEYS } from '@/queries/site-texts'
import { siteTextActions, type SiteText } from '@/actions/site-texts'

interface CappyGame {
  id: string
  title: string
  description: string
  image: string
  url: string
}

interface BackToSchoolStep {
  title: string
  description: string
}

interface BackToSchoolContent {
  title: string
  description: string
  stepsTitle: string
  steps: BackToSchoolStep[]
  buttonText: string
  buttonUrl: string
}

const GAMES_KEY = 'games'
const BACK_TO_SCHOOL_KEY = 'home.back_to_school'

const emptyBackToSchool: BackToSchoolContent = {
  title: '',
  description: '',
  stepsTitle: '',
  steps: [],
  buttonText: '',
  buttonUrl: '',
}

function parseJsonValue<T>(record: SiteText | undefined, fallback: T): T {
  if (!record?.value) return fallback
  return JSON.parse(record.value) as T
}

function getRecord(data: { data?: SiteText[] } | undefined, key: string) {
  return data?.data?.find((item) => item.key === key)
}

function useStructuredSiteText(key: string) {
  const queryClient = useQueryClient()
  const { selectedSiteId } = useSite()
  const languageCode = useContentLanguage()
  const query = useSiteTextList(
    { page: 1, pageSize: 500, key, languageCode, siteId: selectedSiteId || undefined },
    { enabled: !!selectedSiteId && !!languageCode }
  )
  const record = useMemo(() => getRecord(query.data, key), [query.data, key])

  const save = async (value: unknown) => {
    if (!selectedSiteId || !languageCode) return
    const payload = { value: JSON.stringify(value) }
    if (record) {
      await siteTextActions.update(record.id, payload)
    } else {
      await siteTextActions.create({ siteId: selectedSiteId, languageCode, key, ...payload })
    }
    await queryClient.invalidateQueries({ queryKey: SITE_TEXT_KEYS.lists() })
  }

  return { ...query, record, save }
}

export function CappyGamesForm() {
  const { t } = useTranslation()
  const { isLoading, error, record, save } = useStructuredSiteText(GAMES_KEY)
  const [games, setGames] = useState<CappyGame[]>([])
  const [parseError, setParseError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    try {
      const value = parseJsonValue<unknown>(record, [])
      if (!Array.isArray(value) || value.some((item) => !item || typeof item !== 'object')) {
        throw new Error('Invalid games content')
      }
      setGames(value.map((item) => ({
        id: typeof item.id === 'string' ? item.id : '',
        title: typeof item.title === 'string' ? item.title : '',
        description: typeof item.description === 'string' ? item.description : '',
        image: typeof item.image === 'string' ? item.image : '',
        url: typeof item.url === 'string' ? item.url : '',
      })))
      setParseError(false)
    } catch {
      setParseError(true)
    }
  }, [record])

  const hasInvalidGames = games.some((game) => !game.id.trim() || !game.title.trim() || !game.url.trim())
    || new Set(games.map((game) => game.id.trim())).size !== games.length

  const handleSave = async () => {
    if (hasInvalidGames) return
    setIsSaving(true)
    try {
      await save(games)
      toast.success(t('Changes saved'))
    } catch (saveError) {
      const message = (saveError as { response?: { data?: { error?: string } } }).response?.data?.error
      toast.error(message || t('Could not save the changes'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ModuleSection
      title={t('Cappy games')}
      description={t('Manage the games shown in the Cappy home page carousel.')}
      actions={
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || hasInvalidGames || parseError}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? t('Saving...') : t('Save changes')}
        </button>
      }
    >
      {isLoading ? (
        <p className="text-muted-foreground">{t('Loading...')}</p>
      ) : error ? (
        <p className="text-red-500">{t('Could not load the content')}</p>
      ) : parseError ? (
        <p className="text-red-500">{t('The saved games content is invalid. Correct it in the CMS before saving.')}</p>
      ) : (
        <div className="space-y-5">
          {games.map((game, index) => (
            <div key={`${game.id}-${index}`} className="rounded-lg border border-border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t('Game')} {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => setGames((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  className="text-sm text-red-600 hover:underline"
                >
                  {t('Remove')}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label={t('Game ID')}
                  value={game.id}
                  required
                  onChange={(id) => setGames((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, id } : item))}
                />
                <TextField
                  label={t('Game title')}
                  value={game.title}
                  required
                  onChange={(title) => setGames((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item))}
                />
                <TextField
                  label={t('Game image URL')}
                  value={game.image}
                  type="url"
                  onChange={(image) => setGames((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, image } : item))}
                />
                <TextField
                  label={t('Game link')}
                  value={game.url}
                  type="url"
                  required
                  onChange={(url) => setGames((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url } : item))}
                />
                <div className="md:col-span-2">
                  <TextField
                    label={t('Game description')}
                    value={game.description}
                    textarea
                    onChange={(description) => setGames((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, description } : item))}
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setGames((current) => [...current, { id: `game-${Date.now()}`, title: '', description: '', image: '', url: '' }])}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
          >
            {t('Add game')}
          </button>
          {hasInvalidGames && games.length > 0 && (
            <p className="text-sm text-red-500">{t('Each game needs a unique ID, title, and link before saving.')}</p>
          )}
        </div>
      )}
    </ModuleSection>
  )
}

export function CappyBackToSchoolForm() {
  const { t } = useTranslation()
  const { isLoading, error, record, save } = useStructuredSiteText(BACK_TO_SCHOOL_KEY)
  const [content, setContent] = useState<BackToSchoolContent>(emptyBackToSchool)
  const [parseError, setParseError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    try {
      const value = parseJsonValue<Partial<BackToSchoolContent>>(record, emptyBackToSchool)
      if (!value || typeof value !== 'object' || !Array.isArray(value.steps)) {
        throw new Error('Invalid back-to-school content')
      }
      setContent({
        title: value.title ?? '',
        description: value.description ?? '',
        stepsTitle: value.stepsTitle ?? '',
        steps: value.steps.map((step) => ({
          title: typeof step.title === 'string' ? step.title : '',
          description: typeof step.description === 'string' ? step.description : '',
        })),
        buttonText: value.buttonText ?? '',
        buttonUrl: value.buttonUrl ?? '',
      })
      setParseError(false)
    } catch {
      setParseError(true)
    }
  }, [record])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await save(content)
      toast.success(t('Changes saved'))
    } catch (saveError) {
      const message = (saveError as { response?: { data?: { error?: string } } }).response?.data?.error
      toast.error(message || t('Could not save the changes'))
    } finally {
      setIsSaving(false)
    }
  }

  const updateStep = (index: number, update: Partial<BackToSchoolStep>) => {
    setContent((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) => stepIndex === index ? { ...step, ...update } : step),
    }))
  }

  return (
    <ModuleSection
      title={t('Back-to-school promotion')}
      description={t('Manage the title, participation steps, and button shown in the Cappy home page promotion.')}
      actions={
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isLoading || isSaving || parseError}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? t('Saving...') : t('Save changes')}
        </button>
      }
    >
      {isLoading ? (
        <p className="text-muted-foreground">{t('Loading...')}</p>
      ) : error ? (
        <p className="text-red-500">{t('Could not load the content')}</p>
      ) : parseError ? (
        <p className="text-red-500">{t('The saved promotion content is invalid. Correct it in the CMS before saving.')}</p>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label={t('Title')} value={content.title} onChange={(title) => setContent((current) => ({ ...current, title }))} />
            <TextField label={t('Steps title')} value={content.stepsTitle} onChange={(stepsTitle) => setContent((current) => ({ ...current, stepsTitle }))} />
            <div className="md:col-span-2">
              <TextField label={t('Description')} value={content.description} textarea onChange={(description) => setContent((current) => ({ ...current, description }))} />
            </div>
            <TextField label={t('Button text')} value={content.buttonText} onChange={(buttonText) => setContent((current) => ({ ...current, buttonText }))} />
            <TextField label={t('Button link')} value={content.buttonUrl} type="url" onChange={(buttonUrl) => setContent((current) => ({ ...current, buttonUrl }))} />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">{t('Participation steps')}</h3>
            {content.steps.map((step, index) => (
              <div key={index} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{t('Step')} {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => setContent((current) => ({ ...current, steps: current.steps.filter((_, stepIndex) => stepIndex !== index) }))}
                    className="text-sm text-red-600 hover:underline"
                  >
                    {t('Remove')}
                  </button>
                </div>
                <TextField label={t('Step title')} value={step.title} onChange={(title) => updateStep(index, { title })} />
                <TextField label={t('Step description')} value={step.description} textarea onChange={(description) => updateStep(index, { description })} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setContent((current) => ({ ...current, steps: [...current.steps, { title: '', description: '' }] }))}
              className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
            >
              {t('Add step')}
            </button>
          </div>
        </div>
      )}
    </ModuleSection>
  )
}
