export const SITE_MODULES = [
  'pages',
  'products',
  'product_categories',
  'recipes',
  'news',
  'health',
  'descubrenos',
  'gallery',
  'modals',
  'contact',
  'footer',
  'navigation',
  'social_media',
  'top_messages',
  'zambos_truck',
  'home',
  'about_us',
  'messages',
  'not_found',
] as const

export type SiteModuleKey = (typeof SITE_MODULES)[number]

export interface SiteModuleDefinition {
  key: SiteModuleKey
  label: string
  description: string
}

export interface SiteModuleGroup {
  label: string
  modules: SiteModuleDefinition[]
}

export const SITE_MODULE_GROUPS: SiteModuleGroup[] = [
  {
    label: 'Catalog',
    modules: [
      { key: 'products', label: 'Products', description: 'Product catalog with sizes, colors and images.' },
      { key: 'product_categories', label: 'Product Categories', description: 'Filters used to group products.' },
      { key: 'recipes', label: 'Recipes', description: 'Recipes with ingredients, steps and related products.' },
      { key: 'news', label: 'News', description: 'News and blog articles.' },
    ],
  },
  {
    label: 'Site pages',
    modules: [
      { key: 'home', label: 'Home page', description: 'Sections of the home page: titles, recipe videos and newsletter.' },
      { key: 'about_us', label: 'About us', description: 'About us page: header, history timeline and closing text.' },
      { key: 'pages', label: 'Pages', description: 'Banners and SEO of each page.' },
      { key: 'health', label: 'Health', description: 'Health page with slides, videos and icons.' },
      { key: 'descubrenos', label: 'Descúbrenos', description: 'Instagram posts section.' },
      { key: 'gallery', label: 'Gallery', description: 'Image gallery.' },
      { key: 'zambos_truck', label: 'Zambos Truck', description: 'Zambos Truck page and request form.' },
      { key: 'not_found', label: 'Page not found', description: 'Texts of the 404 page.' },
    ],
  },
  {
    label: 'Whole site',
    modules: [
      { key: 'footer', label: 'Footer', description: 'Footer texts, links and phone numbers.' },
      { key: 'navigation', label: 'Navigation', description: 'Header menu and breadcrumbs.' },
      { key: 'social_media', label: 'Social Media', description: 'Links to social networks.' },
      { key: 'top_messages', label: 'Top Messages', description: 'Announcement bar at the top of the site.' },
      { key: 'contact', label: 'Contact', description: 'Contact page and offices.' },
      { key: 'messages', label: 'Messages and forms', description: 'Form validation messages and confirmations.' },
      { key: 'modals', label: 'Modals', description: 'Pop-up windows shown on the site.' },
    ],
  },
]

export const PATH_MODULES: Record<string, SiteModuleKey[]> = {
  '/pages': ['pages'],
  '/products': ['products'],
  '/product-categories': ['product_categories'],
  '/recipes': ['recipes'],
  '/news': ['news'],
  '/health': ['health'],
  '/descubrenos': ['descubrenos'],
  '/gallery': ['gallery'],
  '/modals': ['modals'],
  '/zambos-truck': ['zambos_truck'],
  '/contact': ['contact'],
  '/footer': ['footer'],
  '/navigation': ['navigation'],
  '/social-media': ['social_media'],
  '/top-messages': ['top_messages'],
  '/home-content': ['home'],
  '/about-us': ['about_us'],
  '/messages': ['messages'],
  '/not-found-page': ['not_found'],
}
