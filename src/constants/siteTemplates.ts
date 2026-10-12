export const SITE_TEMPLATES = [
  'standard',
  'zambos',
  'yumminuts',
  'snacksyummies',
  'taqueritos_gaming',
] as const

export type SiteTemplateKey = (typeof SITE_TEMPLATES)[number]

export const SITE_TEMPLATE_OPTIONS: { key: SiteTemplateKey; label: string }[] = [
  { key: 'standard', label: 'Standard (no special design)' },
  { key: 'zambos', label: 'Zambos design' },
  { key: 'yumminuts', label: 'Yummi Nuts design' },
  { key: 'snacksyummies', label: 'Snacks Yummies design' },
  { key: 'taqueritos_gaming', label: 'Taqueritos gaming design' },
]
