export interface SectionTextField {
  key: string
  label: string
  help?: string
  textarea?: boolean
  image?: boolean
  type?: 'text' | 'url' | 'color'
}

export interface SectionTextGroup {
  id: string
  title: string
  description: string
  fields: SectionTextField[]
}

export type SiteVariantMap<T> = Record<string, T> & { default: T }

export function pickVariant<T>(map: SiteVariantMap<T>, siteTemplate: string | undefined): T {
  return (siteTemplate && map[siteTemplate]) || map.default
}

export const HOME_TEXT_GROUPS: Record<string, SectionTextGroup> = {
  products: {
    id: 'products',
    title: 'Products section',
    description: 'Title and subtitle shown above the products on the home page and the products page.',
    fields: [
      { key: 'home.products.title', label: 'Section title' },
      { key: 'home.products.subtitle', label: 'Subtitle', help: 'Only some sites show it.' },
    ],
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
    title: 'Social networks',
    description: 'Texts of the social networks block. The Instagram posts are managed in Descúbrenos.',
    fields: [
      { key: 'home.socialmedia.tagtitle', label: 'Small highlighted word' },
      { key: 'home.socialmedia.title', label: 'Section title' },
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
  gallery: {
    id: 'gallery',
    title: 'Gallery section',
    description: 'Title of the gallery block. The images are managed in Gallery.',
    fields: [
      { key: 'home.gallery.title', label: 'Section title' },
      { key: 'home.gallery.subtitle', label: 'Subtitle' },
    ],
  },
  whereToBuy: {
    id: 'whereToBuy',
    title: 'Where to buy',
    description: 'Stores and apps shown in the "Where to buy" carousel and window.',
    fields: [],
  },
  newsletter: {
    id: 'newsletter',
    title: 'Newsletter',
    description: 'Subscription block shown on the home page and reused by the site.',
    fields: [
      { key: 'home.newsletter.title', label: 'Title', textarea: true },
      { key: 'home.newsletter.placeholder', label: 'Email field placeholder' },
      { key: 'home.newsletter.button', label: 'Button text' },
    ],
  },
  cardVideo: {
    id: 'cardVideo',
    title: 'Video feature card',
    description: 'Text, video source, and background color for the home page video card.',
    fields: [
      { key: 'cardVideo.badge', label: 'Badge' },
      { key: 'cardVideo.title', label: 'Title' },
      { key: 'cardVideo.titleHighlight', label: 'Highlighted title' },
      { key: 'cardVideo.description1', label: 'First description', textarea: true },
      { key: 'cardVideo.description2', label: 'Second description', textarea: true },
      { key: 'cardVideo.videoSrc', label: 'Video URL', type: 'url' },
      { key: 'cardVideo.backgroundColor', label: 'Background color', type: 'color' },
    ],
  },
  cardQuiz: {
    id: 'cardQuiz',
    title: 'Quiz feature card',
    description: 'Text, image or video source, and background color for the home page quiz card.',
    fields: [
      { key: 'cardQuiz.badge', label: 'Badge' },
      { key: 'cardQuiz.title', label: 'Title' },
      { key: 'cardQuiz.titleHighlight', label: 'Highlighted title' },
      { key: 'cardQuiz.description1', label: 'Description', textarea: true },
      { key: 'cardQuiz.titleButton', label: 'Button text' },
      { key: 'cardQuiz.imageSrc', label: 'Image or video URL', type: 'url' },
      { key: 'cardQuiz.backgroundColor', label: 'Background color', type: 'color' },
    ],
  },
  textHome: {
    id: 'textHome',
    title: 'Home introduction',
    description: 'Introduction text displayed on the home page.',
    fields: [
      { key: 'home.text_home.since', label: 'Since', help: 'Only some sites show it.' },
      { key: 'home.text_home.title', label: 'Title' },
      { key: 'home.text_home.subtitle', label: 'Highlighted subtitle' },
      { key: 'home.text_home.description', label: 'Description', textarea: true },
      { key: 'home.text_home.description2', label: 'Additional description', textarea: true },
      { key: 'home.text_home.button', label: 'Primary button text' },
      { key: 'home.text_home.button2', label: 'Secondary button text' },
    ],
  },
}

export interface HomeSectionDefinition {
  key: string
  label: string
}

export const HOME_SECTION_OPTIONS: HomeSectionDefinition[] = [
  { key: 'products', label: 'Products section' },
  { key: 'recipes', label: 'Recipes section' },
  { key: 'videos', label: 'Recipe videos' },
  { key: 'brands', label: 'Brands section' },
  { key: 'newProducts', label: 'New products' },
  { key: 'quiz', label: 'Quiz invitation' },
  { key: 'social', label: 'Social networks' },
  { key: 'delivery', label: 'Where to find us' },
  { key: 'gallery', label: 'Gallery section' },
  { key: 'whereToBuy', label: 'Where to buy' },
  { key: 'newsletter', label: 'Newsletter' },
  { key: 'cardVideo', label: 'Video feature card' },
  { key: 'cardQuiz', label: 'Quiz feature card' },
  { key: 'textHome', label: 'Home introduction' },
  { key: 'games', label: 'Games' },
  { key: 'backToSchool', label: 'Back-to-school promotion' },
]

export const HOME_SECTION_KEYS = HOME_SECTION_OPTIONS.map((option) => option.key)

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
  snacksyummies: ['required', 'invalidEmail', 'subscribed'],
  taqueritos_gaming: ['productNotFound'],
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
  zambos: ['code', 'title', 'description', 'goHome', 'exploreProducts', 'productsTitle', 'productsDescription'],
  default: ['code', 'title', 'description', 'goHome', 'exploreProducts', 'productsTitle'],
}

export const PRODUCTS_PAGE_FIELDS: SectionTextField[] = [
  { key: 'products.page.view_details', label: 'View details button', help: 'Button on each product card.' },
  { key: 'delivery.amazon_buy_url', label: 'Buy button link', help: 'Where the Buy button of the header and product pages goes.' },
]

export const PRODUCTS_PAGE_SITES: string[] = ['zambos']

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

export const RECIPES_PAGE_SITES: string[] = ['snacksyummies']

export const BREADCRUMB_SITES: string[] = ['zambos', 'yumminuts', 'taqueritos_gaming', 'snacksyummies']

export const BREADCRUMB_FIELD_KEYS: SiteVariantMap<string[] | 'all'> = {
  snacksyummies: ['breadcrumb.home'],
  default: 'all',
}

export const HEADER_TEXT_FIELDS: SectionTextField[] = [
  { key: 'navigation.contact_button', label: 'Contact button', help: 'Last item of the menu, links to the contact page.' },
]

export const HEADER_TEXT_SITES: string[] = ['taqueritos_gaming']

export interface FooterFieldDefinition {
  name: FooterTextField
  label: string
  textarea?: boolean
  placeholder?: string
}

export type FooterTextField =
  | 'mainText' | 'description' | 'choose' | 'followUs' | 'contactUs' | 'contactTitle'
  | 'address' | 'hours' | 'phone' | 'email'
  | 'newsletter' | 'newsletterDescription' | 'emailPlaceholder' | 'newsletterButton'
  | 'home' | 'help' | 'mainText2'
  | 'copyright' | 'privacyPolicyText' | 'privacyPolicyUrl'

export const FOOTER_FIELD_GROUPS: { title: string; fields: FooterFieldDefinition[] }[] = [
  {
    title: 'Main texts',
    fields: [
      { name: 'mainText', label: 'Main text' },
      { name: 'mainText2', label: 'Main text (highlighted part)', placeholder: 'conquista' },
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
    title: 'Column titles',
    fields: [
      { name: 'home', label: '"Links" column title' },
      { name: 'help', label: '"Social networks" column title' },
    ],
  },
  {
    title: 'Legal',
    fields: [
      { name: 'copyright', label: 'Copyright' },
      { name: 'privacyPolicyText', label: 'Privacy policy link text' },
      { name: 'privacyPolicyUrl', label: 'Privacy policy link URL' },
    ],
  },
]

export const FOOTER_FIELDS: SiteVariantMap<FooterTextField[] | 'all'> = {
  yumminuts: ['newsletter', 'newsletterDescription', 'home', 'help', 'contactUs', 'copyright'],
  zambos: ['contactTitle'],
  snacksyummies: ['address', 'hours', 'phone', 'newsletter', 'emailPlaceholder', 'newsletterButton', 'copyright', 'privacyPolicyText', 'privacyPolicyUrl'],
  taqueritos_gaming: ['followUs', 'contactUs'],
  default: 'all',
}

export const FOOTER_PHONE_SITES: SiteVariantMap<boolean> = {
  taqueritos_gaming: false,
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
  snacksyummies: ['year', 'text', 'imageId', 'mobileImageId'],
  default: ['year', 'title', 'text', 'imageId', 'mobileImageId'],
}

export const ABOUT_TIMELINE_YEAR_REQUIRED: SiteVariantMap<boolean> = {
  zambos: false,
  default: true,
}

export const ABOUT_LAYOUT: SiteVariantMap<string[]> = {
  taqueritos_gaming: ['story', 'presence', 'experiences', 'cards'],
  default: ['header', 'timeline', 'closing'],
}

export const ABOUT_EXTRA_GROUPS: Record<string, SectionTextGroup> = {
  story: {
    id: 'story',
    title: 'Our story',
    description: 'Title and paragraphs of the first block of the page.',
    fields: [
      { key: 'about_us.section_title', label: 'Title' },
      { key: 'about_us.section_paragraphs', label: 'Paragraphs', textarea: true, help: 'Write each paragraph on its own line.' },
    ],
  },
  presence: {
    id: 'presence',
    title: 'Presence',
    description: 'Block shown next to the map of countries.',
    fields: [
      { key: 'about_us.presence_title', label: 'Title' },
      { key: 'about_us.presence_description', label: 'Description', textarea: true },
    ],
  },
  experiences: {
    id: 'experiences',
    title: 'Experiences',
    description: 'Title and description of the cards block.',
    fields: [
      { key: 'about_us.experiences_title', label: 'Title' },
      { key: 'about_us.experiences_description', label: 'Description', textarea: true },
    ],
  },
  cards: {
    id: 'cards',
    title: 'Experience cards',
    description: 'Texts of the three cards. Their images and links are fixed.',
    fields: [
      { key: 'about_us.cards.products.title', label: 'Products card: title' },
      { key: 'about_us.cards.products.cta', label: 'Products card: button' },
      { key: 'about_us.cards.products.description', label: 'Products card: description', textarea: true },
      { key: 'about_us.cards.challenges.title', label: 'Challenges card: title' },
      { key: 'about_us.cards.challenges.cta', label: 'Challenges card: button' },
      { key: 'about_us.cards.challenges.description', label: 'Challenges card: description', textarea: true },
      { key: 'about_us.cards.recipes.title', label: 'Recipes card: title' },
      { key: 'about_us.cards.recipes.cta', label: 'Recipes card: button' },
      { key: 'about_us.cards.recipes.description', label: 'Recipes card: description', textarea: true },
    ],
  },
}

export const PRODUCT_DESIGN_SITES: string[] = ['taqueritos_gaming']

export const PRODUCT_BANNER_SITES: string[] = ['taqueritos_gaming']

export interface MenuItemActionOption {
  value: string
  label: string
}

export const MENU_ITEM_ACTIONS: SiteVariantMap<MenuItemActionOption[]> = {
  taqueritos_gaming: [
    { value: 'where_to_buy', label: 'Open the "Where to buy" window' },
    { value: 'products_menu', label: 'Show the products list' },
    { value: 'games_menu', label: 'Show the games list' },
    { value: 'mobile_only', label: 'Show only in the mobile menu' },
  ],
  default: [],
}
