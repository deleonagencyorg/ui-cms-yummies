import { useTranslation } from 'react-i18next'
import ModulePage from '@/components/ModulePage'
import SectionTextsForm from '@/components/SectionTextsForm'
import { NOT_FOUND_FIELDS } from '@/constants/siteSections'

export default function NotFoundTexts() {
  const { t } = useTranslation()

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
              fields={NOT_FOUND_FIELDS}
            />
          ),
        },
      ]}
    />
  )
}
