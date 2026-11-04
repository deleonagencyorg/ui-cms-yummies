import { useTranslation } from 'react-i18next'
import Layout from '@/components/Layout'

export default function Settings() {
  const { t } = useTranslation()
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-card rounded-lg shadow-lg border border-border p-6">
          <h2 className="text-2xl font-bold text-card-foreground mb-6">{t("Settings")}</h2>

          <div className="space-y-6">
            {/* Appearance */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">{t("Appearance")}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">{t("Theme")}</p>
                    <p className="text-sm text-muted-foreground">{t("Choose your preferred theme")}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground">
                      {t("Auto")}
                    </button>
                    <button className="px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {t("Light")}
                    </button>
                    <button className="px-3 py-1.5 text-sm rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80">
                      {t("Dark")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">{t("Notifications")}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">{t("Email Notifications")}</p>
                    <p className="text-sm text-muted-foreground">{t("Receive email updates about your account")}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">{t("Push Notifications")}</p>
                    <p className="text-sm text-muted-foreground">{t("Receive push notifications in your browser")}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">{t("Security")}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">{t("Two-Factor Authentication")}</p>
                    <p className="text-sm text-muted-foreground">{t("Add an extra layer of security to your account")}</p>
                  </div>
                  <button className="text-primary hover:underline font-medium">{t("Enable")}</button>
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">{t("Change Password")}</p>
                    <p className="text-sm text-muted-foreground">{t("Update your password regularly")}</p>
                  </div>
                  <button className="text-primary hover:underline font-medium">{t("Change")}</button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">{t("Danger Zone")}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-100">{t("Delete Account")}</p>
                    <p className="text-sm text-red-700 dark:text-red-300">{t("Permanently delete your account and all data")}</p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium">
                    {t("Delete")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
