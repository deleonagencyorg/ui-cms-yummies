import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import en from '@/locales/en.json'
import es from '@/locales/es.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: { en: [], default: ['es'] },
    supportedLngs: ['en', 'es'],
    defaultNS: 'translation',
    ns: ['translation'],
    nsSeparator: false,
    returnEmptyString: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
  })

export default i18n
