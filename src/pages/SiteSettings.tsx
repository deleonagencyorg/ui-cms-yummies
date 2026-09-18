import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Layout from '@/components/Layout'
import Tabs from '@/components/Tabs'
import { FooterPageContent } from './Footer'
import { NavigationPageContent } from './Navigation'
import { SocialMediaContent } from './SocialMedia'
import { TopMessagesContent } from './TopMessages'
import { ContactPageContent } from './Contact'
import { StructuredSiteTextSection } from './StructuredSiteTextSection'

const TAB_KEYS = [
  'footer',
  'navigation',
  'social-media',
  'top-messages',
  'contact',
  'home',
  'about-us',
  'meta',
  'form-validation',
  'subscribe',
  'not-found',
  'errors',
] as const

type TabKey = (typeof TAB_KEYS)[number]

function isTabKey(value: string | null): value is TabKey {
  return !!value && (TAB_KEYS as readonly string[]).includes(value)
}

export default function SiteSettings() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeKey: TabKey = isTabKey(tabParam) ? tabParam : 'footer'

  const tabs = [
    { key: 'footer', label: t('nav.footer'), content: <FooterPageContent /> },
    { key: 'navigation', label: t('nav.navigation'), content: <NavigationPageContent /> },
    { key: 'social-media', label: t('nav.socialMedia'), content: <SocialMediaContent /> },
    { key: 'top-messages', label: t('nav.topMessages'), content: <TopMessagesContent /> },
    { key: 'contact', label: t('nav.contact'), content: <ContactPageContent /> },
    {
      key: 'home',
      label: 'Inicio',
      content: (
        <>
          <StructuredSiteTextSection
            title="Contenido de Inicio"
            description="Administra los textos dinámicos que se muestran junto a las recetas en la página de inicio."
            prefix="recipes.home"
            fields={[
              { key: 'title', label: 'Título de recetas', textarea: true },
              { key: 'view_more', label: 'Botón ver más' },
            ]}
          />
          <StructuredSiteTextSection
            title="Formulario de suscripción en Inicio"
            description="Administra los textos del formulario de suscripción que aparece en Inicio."
            prefix="home.newsletter"
            fields={[
              { key: 'title', label: 'Título', textarea: true },
              { key: 'placeholder', label: 'Texto del campo de correo' },
              { key: 'button', label: 'Texto del botón' },
            ]}
          />
        </>
      ),
    },
    {
      key: 'about-us',
      label: 'Nosotros',
      content: (
        <StructuredSiteTextSection
          title="Contenido de Nosotros"
          description="Administra los textos de la sección."
          prefix="about_us"
          fields={[
            { key: 'title', label: 'Título' },
            { key: 'subtitle', label: 'Subtítulo' },
            { key: 'intro', label: 'Introducción', textarea: true },
            { key: 'conclusion', label: 'Conclusión', textarea: true },
          ]}
        />
      ),
    },
    {
      key: 'meta',
      label: 'Meta',
      content: (
        <StructuredSiteTextSection
          title="Meta de las páginas"
          description="Administra títulos y descripciones SEO por página e idioma."
          prefix="meta"
          fields={[
            { key: 'home.title', label: 'Título de Inicio', textarea: true },
            { key: 'home.description', label: 'Descripción de Inicio', textarea: true },
            { key: 'products.title', label: 'Título de Productos', textarea: true },
            { key: 'products.description', label: 'Descripción de Productos', textarea: true },
            { key: 'recipes.title', label: 'Título de Recetas', textarea: true },
            { key: 'recipes.description', label: 'Descripción de Recetas', textarea: true },
            { key: 'news.title', label: 'Título de Noticias', textarea: true },
            { key: 'news.description', label: 'Descripción de Noticias', textarea: true },
            { key: 'contact.title', label: 'Título de Contacto', textarea: true },
            { key: 'contact.description', label: 'Descripción de Contacto', textarea: true },
            { key: 'about_us.title', label: 'Título de Nosotros', textarea: true },
            { key: 'about_us.description', label: 'Descripción de Nosotros', textarea: true },
            { key: 'promotions.title', label: 'Título de Promociones', textarea: true },
            { key: 'promotions.description', label: 'Descripción de Promociones', textarea: true },
            { key: 'brands.title', label: 'Título de Marcas', textarea: true },
            { key: 'brands.description', label: 'Descripción de Marcas', textarea: true },
            { key: 'yummiesone.title', label: 'Título de Yummies One', textarea: true },
            { key: 'yummiesone.description', label: 'Descripción de Yummies One', textarea: true },
            { key: 'privacy.title', label: 'Título de Privacidad', textarea: true },
            { key: 'privacy.description', label: 'Descripción de Privacidad', textarea: true },
          ]}
        />
      ),
    },
    {
      key: 'form-validation',
      label: 'Validación de formularios',
      content: (
        <StructuredSiteTextSection
          title="Mensajes de validación"
          description="Administra los mensajes que aparecen cuando un formulario tiene errores."
          prefix="form_validation"
          fields={[
            { key: 'required', label: 'Campo obligatorio' },
            { key: 'invalid_email', label: 'Correo electrónico inválido' },
            { key: 'password_min', label: 'Contraseña demasiado corta' },
            { key: 'passwords_not_match', label: 'Las contraseñas no coinciden' },
          ]}
        />
      ),
    },
    {
      key: 'subscribe',
      label: 'Suscripción',
      content: (
        <StructuredSiteTextSection
          title="Mensajes de suscripción"
          description="Administra el mensaje que se muestra después de una suscripción."
          prefix="subscribe"
          fields={[{ key: 'success', label: 'Suscripción exitosa', textarea: true }]}
        />
      ),
    },
    {
      key: 'not-found',
      label: 'Página no encontrada',
      content: (
        <StructuredSiteTextSection
          title="Página no encontrada (404)"
          description="Administra los textos que aparecen cuando una página no existe."
          prefix="not_found"
          fields={[
            { key: 'code', label: 'Código de error' },
            { key: 'title', label: 'Título', textarea: true },
            { key: 'description', label: 'Descripción', textarea: true },
            { key: 'go_home', label: 'Botón volver al inicio' },
            { key: 'explore_products', label: 'Botón explorar productos' },
            { key: 'products_title', label: 'Título de productos', textarea: true },
          ]}
        />
      ),
    },
    {
      key: 'errors',
      label: 'Mensajes de error',
      content: (
        <StructuredSiteTextSection
          title="Mensajes de error"
          description="Administra los mensajes de error que el sitio muestra al usuario."
          prefix="errors"
          fields={[{ key: 'product_not_found', label: 'Producto no encontrado', textarea: true }]}
        />
      ),
    },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">{t('nav.siteSettings')}</h2>
          <p className="text-muted-foreground mt-1">{t('siteSettings.description')}</p>
        </div>

        <Tabs
          tabs={tabs}
          activeKey={activeKey}
          onChange={(key) => setSearchParams({ tab: key })}
        />
      </div>
    </Layout>
  )
}
