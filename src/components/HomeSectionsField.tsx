import { useTranslation } from 'react-i18next'
import { HOME_SECTION_OPTIONS } from '@/constants/siteSections'

interface HomeSectionsFieldProps {
  value: string[]
  onChange: (sections: string[]) => void
}

export default function HomeSectionsField({ value, onChange }: HomeSectionsFieldProps) {
  const { t } = useTranslation()
  const selected = new Set(value)

  const toggle = (key: string) => {
    const next = new Set(selected)
    if (next.has(key)) {
      next.delete(key)
    } else {
      next.add(key)
    }
    onChange(HOME_SECTION_OPTIONS.map((option) => option.key).filter((optionKey) => next.has(optionKey)))
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-card-foreground">{t("Home page sections")}</h4>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        {t("Choose the blocks this site shows on its home page. Only these blocks appear in the Home page module.")}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {HOME_SECTION_OPTIONS.map((option) => {
          const checked = selected.has(option.key)
          return (
            <label
              key={option.key}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(option.key)}
                className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm font-medium text-card-foreground">{t(option.label)}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
