import { useTranslation } from 'react-i18next'
import ModulePage from '@/components/ModulePage'
import SectionTextsForm from '@/components/SectionTextsForm'
import { useSiteModules } from '@/lib/siteModules'
import { MESSAGE_FIELDS, MESSAGE_SECTIONS, pickVariant } from '@/constants/siteSections'

export default function Messages() {
  const { t } = useTranslation()
  const { selectedSite } = useSiteModules()
  const fields = pickVariant(MESSAGE_SECTIONS, selectedSite?.slug).map((id) => MESSAGE_FIELDS[id])

  return (
    <ModulePage
      title={t("Messages and forms")}
      description={t("Messages people see when they fill in forms on the site.")}
      tabs={[
        {
          key: 'messages',
          label: t("Messages and forms"),
          content: (
            <SectionTextsForm
              title={t("Form messages")}
              description={t("Validation errors and confirmations.")}
              fields={fields}
            />
          ),
        },
      ]}
    />
  )
}
