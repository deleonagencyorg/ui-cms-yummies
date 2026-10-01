export interface SectionTextField {
  key: string
  label: string
  help?: string
  textarea?: boolean
  image?: boolean
}

export interface SectionTextGroup {
  id: string
  title: string
  description: string
  fields: SectionTextField[]
}

export type SiteVariantMap<T> = Record<string, T> & { default: T }

export function pickVariant<T>(map: SiteVariantMap<T>, siteSlug: string | undefined): T {
  return (siteSlug && map[siteSlug]) || map.default
}

export const HOME_TEXT_GROUPS: Record<string, SectionTextGroup> = {
  products: {
    id: 'products',
    title: 'Products section',
    description: 'Title shown above the products on the home page.',
    fields: [{ key: 'home.products.title', label: 'Section title' }],
  },
  recipes: {
    id: 'recipes',
    title: 'Recipes section',
    description: 'Title and button of the recipes block on the home page.',
    fields: [
      { key: 'recipes.home.title', label: 'Section title', textarea: true },
      { key: 'recipes.home.view_more', label: 'View more button' },
    ],
  },
  videos: {
    id: 'videos',
    title: 'Recipe videos',
    description: 'Title shown above the recipe videos carousel.',
    fields: [{ key: 'home.videos.title', label: 'Section title' }],
  },
  brands: {
    id: 'brands',
    title: 'Brands section',
    description: 'Title shown above the brands carousel.',
    fields: [{ key: 'home.brands.title', label: 'Section title' }],
  },
  newProducts: {
    id: 'newProducts',
    title: 'New products',
    description: 'Title of the new products block. The products shown are the ones marked as New in Products.',
    fields: [
      { key: 'home.new_products.tagtitle', label: 'Small highlighted word' },
      { key: 'home.new_products.title', label: 'Section title' },
    ],
  },
  quiz: {
    id: 'quiz',
    title: 'Quiz invitation',
    description: 'Block that invites people to take the quiz.',
    fields: [
      { key: 'home.quiz.title_image', label: 'Title image', image: true },
      { key: 'home.quiz.description', label: 'Description', textarea: true },
      { key: 'home.quiz.button', label: 'Button text' },
      { key: 'home.quiz.button_url', label: 'Button link' },
    ],
  },
  social: {
    id: 'social',
    title: 'Social networks and newsletter',
    description: 'Texts of the social networks block. The Instagram posts are managed in Descúbrenos.',
    fields: [
      { key: 'home.socialmedia.tagtitle', label: 'Small highlighted word' },
      { key: 'home.socialmedia.title', label: 'Section title' },
      { key: 'home.socialmedia.newsletter', label: 'Newsletter invitation', textarea: true },
      { key: 'home.newsletter.placeholder', label: 'Email field placeholder' },
      { key: 'home.newsletter.button', label: 'Button text' },
    ],
  },
  delivery: {
    id: 'delivery',
    title: 'Where to find us',
    description: 'Title of the delivery apps carousel.',
    fields: [
      { key: 'home.delivery.title', label: 'Title' },
      { key: 'home.delivery.subtitle', label: 'Subtitle' },
    ],
  },
  newsletter: {
    id: 'newsletter',
    title: 'Newsletter',
    description: 'Subscription block on the home page.',
    fields: [
      { key: 'home.newsletter.title', label: 'Title' },
      { key: 'home.newsletter.placeholder', label: 'Email field placeholder' },
      { key: 'home.newsletter.button', label: 'Button text' },
    ],
  },
}

export const HOME_SECTIONS: SiteVariantMap<string[]> = {
  zambos: ['products', 'videos', 'newsletter'],
  yumminuts: ['products', 'recipes', 'newsletter'],
  taqueritos: ['brands', 'newProducts', 'quiz', 'social', 'delivery'],
  default: ['products', 'recipes', 'videos', 'newsletter'],
}

export const ABOUT_TEXT_GROUPS: SectionTextGroup[] = [
  {
    id: 'header',
    title: 'Header',
    description: 'Title and introduction at the top of the About us page.',
    fields: [
      { key: 'about_us.title', label: 'Title' },
      { key: 'about_us.subtitle', label: 'Highlighted subtitle' },
      { key: 'about_us.intro', label: 'Introduction', textarea: true },
    ],
  },
  {
    id: 'closing',
    title: 'Closing',
    description: 'Text shown after the history timeline.',
    fields: [{ key: 'about_us.conclusion', label: 'Closing text', textarea: true }],
  },
]

export const MESSAGE_FIELDS: Record<string, SectionTextField> = {
  required: { key: 'form_validation.required', label: 'Required field', help: 'Shown when a required field is empty.' },
  invalidEmail: { key: 'form_validation.invalid_email', label: 'Invalid email', help: 'Shown when the email format is wrong.' },
  subscribed: { key: 'subscribe.success', label: 'Subscription confirmed', help: 'Shown after subscribing to the newsletter.' },
  productNotFound: { key: 'errors.product_not_found', label: 'Product not found', help: 'Shown when a product page does not exist.' },
}

export const MESSAGE_SECTIONS: SiteVariantMap<string[]> = {
  zambos: ['required', 'invalidEmail', 'subscribed', 'productNotFound'],
  taqueritos: ['required', 'invalidEmail', 'subscribed'],
  default: ['required', 'invalidEmail', 'subscribed', 'productNotFound'],
}

export const NOT_FOUND_FIELDS: Record<string, SectionTextField> = {
  code: { key: 'not_found.code', label: 'Big number', help: 'Usually 404.' },
  title: { key: 'not_found.title', label: 'Title' },
  description: { key: 'not_found.description', label: 'Description', textarea: true },
  goHome: { key: 'not_found.go_home', label: 'Go home button' },
  exploreProducts: { key: 'not_found.explore_products', label: 'Explore products button' },
  productsTitle: { key: 'not_found.products_title', label: 'Suggested products title' },
  productsDescription: { key: 'not_found.products_description', label: 'Suggested products description', textarea: true },
}

export const NOT_FOUND_SECTIONS: SiteVariantMap<string[]> = {
  yumminuts: ['code', 'title', 'goHome'],
  zambos: ['code', 'title', 'description', 'goHome', 'exploreProducts', 'productsTitle', 'productsDescription'],
  default: ['code', 'title', 'description', 'goHome', 'exploreProducts', 'productsTitle'],
}

export const PRODUCTS_PAGE_FIELDS: SectionTextField[] = [
  { key: 'products.page.view_details', label: 'View details button', help: 'Button on each product card.' },
  { key: 'delivery.amazon_buy_url', label: 'Buy button link', help: 'Where the Buy button of the header and product pages goes.' },
]

export const PRODUCTS_PAGE_SITES = ['zambos']

export const BREADCRUMB_FIELDS: SectionTextField[] = [
  { key: 'breadcrumb.home', label: 'Home' },
  { key: 'breadcrumb.products', label: 'Products' },
  { key: 'breadcrumb.recipes', label: 'Recipes' },
  { key: 'breadcrumb.news', label: 'News' },
  { key: 'breadcrumb.health', label: 'Health' },
  { key: 'breadcrumb.contact', label: 'Contact' },
  { key: 'breadcrumb.brands', label: 'Brands' },
  { key: 'breadcrumb.yummiesone', label: 'Yummies One' },
]

export const RECIPES_PAGE_FIELDS: SectionTextField[] = [
  { key: 'recipes.page.no_recipes', label: 'No recipes message' },
  { key: 'recipes.page.load_more', label: 'Load more button' },
  { key: 'recipes.page.loading', label: 'Loading text' },
  { key: 'recipes.page.no_more_recipes', label: 'No more recipes message' },
]

export const RECIPES_PAGE_SITES = ['taqueritos']

export const BREADCRUMB_SITES = ['zambos', 'yumminuts']

export interface FooterFieldDefinition {
  name: FooterTextField
  label: string
  textarea?: boolean
}

export type FooterTextField =
  | 'mainText' | 'description' | 'choose' | 'followUs' | 'contactUs' | 'contactTitle'
  | 'address' | 'hours' | 'phone' | 'email'
  | 'newsletter' | 'newsletterDescription' | 'emailPlaceholder' | 'newsletterButton'
  | 'home' | 'products' | 'health' | 'latestNews' | 'contact' | 'help' | 'support'
  | 'instagramText' | 'facebookText'
  | 'copyright' | 'privacyPolicyText' | 'privacyPolicyUrl' | 'privacyPolicy' | 'cookiePolicy'
  | 'termsConditions' | 'complaintsBook'

export const FOOTER_FIELD_GROUPS: { title: string; fields: FooterFieldDefinition[] }[] = [
  {
    title: 'Main texts',
    fields: [
      { name: 'mainText', label: 'Main text' },
      { name: 'description', label: 'Description', textarea: true },
      { name: 'choose', label: '"Choose" title' },
      { name: 'followUs', label: '"Follow us" title' },
      { name: 'contactUs', label: '"Contact us" title' },
      { name: 'contactTitle', label: 'Phone numbers title' },
    ],
  },
  {
    title: 'Contact information',
    fields: [
      { name: 'address', label: 'Address', textarea: true },
      { name: 'hours', label: 'Opening hours' },
      { name: 'phone', label: 'Phone' },
      { name: 'email', label: 'Email' },
    ],
  },
  {
    title: 'Newsletter',
    fields: [
      { name: 'newsletter', label: 'Title' },
      { name: 'newsletterDescription', label: 'Description', textarea: true },
      { name: 'emailPlaceholder', label: 'Email field placeholder' },
      { name: 'newsletterButton', label: 'Button text' },
    ],
  },
  {
    title: 'Menu links',
    fields: [
      { name: 'home', label: 'Home link' },
      { name: 'products', label: 'Products link' },
      { name: 'health', label: 'Health link' },
      { name: 'latestNews', label: 'News link' },
      { name: 'contact', label: 'Contact link' },
      { name: 'help', label: '"Help" title' },
      { name: 'support', label: 'Support link' },
    ],
  },
  {
    title: 'Social networks',
    fields: [
      { name: 'instagramText', label: 'Instagram text' },
      { name: 'facebookText', label: 'Facebook text' },
    ],
  },
  {
    title: 'Legal',
    fields: [
      { name: 'copyright', label: 'Copyright' },
      { name: 'privacyPolicyText', label: 'Privacy policy link text' },
      { name: 'privacyPolicyUrl', label: 'Privacy policy link URL' },
      { name: 'privacyPolicy', label: 'Privacy policy' },
      { name: 'cookiePolicy', label: 'Cookie policy' },
      { name: 'termsConditions', label: 'Terms and conditions' },
      { name: 'complaintsBook', label: 'Complaints book' },
    ],
  },
]

export const FOOTER_FIELDS: SiteVariantMap<FooterTextField[] | 'all'> = {
  yumminuts: ['newsletter', 'newsletterDescription', 'home', 'products', 'health', 'latestNews', 'contact', 'help', 'contactUs', 'copyright'],
  zambos: ['contactTitle'],
  taqueritos: ['address', 'hours', 'phone', 'newsletter', 'emailPlaceholder', 'newsletterButton', 'copyright', 'privacyPolicyText', 'privacyPolicyUrl'],
  default: 'all',
}

export const FOOTER_PHONE_SITES: SiteVariantMap<boolean> = {
  default: true,
}

export const FOOTER_PHONE_FIELDS: SiteVariantMap<string[]> = {
  yumminuts: ['country', 'flagImageId', 'number'],
  default: ['country', 'flag', 'number'],
}

export const HEALTH_ICON_SITES: SiteVariantMap<boolean> = {
  yumminuts: true,
  default: false,
}

export const ABOUT_TIMELINE_FIELDS: SiteVariantMap<string[]> = {
  zambos: ['year', 'title', 'text', 'imageId'],
  taqueritos: ['year', 'text', 'imageId', 'mobileImageId'],
  default: ['year', 'title', 'text', 'imageId', 'mobileImageId'],
}

export const ABOUT_TIMELINE_YEAR_REQUIRED: SiteVariantMap<boolean> = {
  zambos: false,
  default: true,
}

export const FOOTER_LINK_SITES: SiteVariantMap<boolean> = {
  zambos: true,
  default: false,
}
