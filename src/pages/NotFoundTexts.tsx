import { useTranslation } from 'react-i18next'
import ModulePage from '@/components/ModulePage'
import SectionTextsForm from '@/components/SectionTextsForm'
import { useSiteModules } from '@/lib/siteModules'
import { NOT_FOUND_FIELDS, NOT_FOUND_SECTIONS, pickVariant } from '@/constants/siteSections'

export default function NotFoundTexts() {
  const { t } = useTranslation()
  const { selectedSite } = useSiteModules()
  const fields = pickVariant(NOT_FOUND_SECTIONS, selectedSite?.slug).map((id) => NOT_FOUND_FIELDS[id])

  return (
    <ModulePage
      title={t("Page not found")}
      description={t("Texts of the page shown when an address does not exist (404).")}
      tabs={[
        {
          key: 'texts',
          label: t("Page not found"),
          content: (
            <SectionTextsForm
              title={t("404 page texts")}
              description={t("Title and buttons of the page.")}
              fields={fields}
            />
          ),
        },
      ]}
    />
  )
}
