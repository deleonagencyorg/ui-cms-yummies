import { useTranslation } from 'react-i18next'
import { SITE_MODULE_GROUPS, SITE_MODULES, type SiteModuleKey } from '@/constants/siteModules'

interface SiteModulesFieldProps {
  value: SiteModuleKey[]
  onChange: (modules: SiteModuleKey[]) => void
}

export default function SiteModulesField({ value, onChange }: SiteModulesFieldProps) {
  const { t } = useTranslation()
  const selected = new Set(value)

  const toggle = (module: SiteModuleKey) => {
    const next = new Set(selected)
    if (next.has(module)) {
      next.delete(module)
    } else {
      next.add(module)
    }
    onChange(SITE_MODULES.filter((key) => next.has(key)))
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-card-foreground">{t("Site modules")}</h4>
      <p className="text-sm text-muted-foreground mt-1 mb-4">
        {t("Choose the sections this site uses. Only active modules appear in the menu when this site is selected.")}
      </p>
      <div className="space-y-5">
        {SITE_MODULE_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {t(group.label)}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {group.modules.map((module) => {
                const checked = selected.has(module.key)
                return (
                  <label
                    key={module.key}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-secondary'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(module.key)}
                      className="mt-0.5 w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                    />
                    <span>
                      <span className="block text-sm font-medium text-card-foreground">{t(module.label)}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5">{t(module.description)}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
