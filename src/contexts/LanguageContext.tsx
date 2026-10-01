/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import en from '@/locales/en.json'
import es from '@/locales/es.json'

type Language = 'en' | 'es'

interface Dictionary {
  [key: string]: string | Dictionary
}
type Dictionaries = Record<Language, Dictionary>

const dictionaries: Dictionaries = {
  en,
  es,
}

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const STORAGE_KEY = 'language'

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null
    if (stored === 'en' || stored === 'es') return stored
    return 'en'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language)
  }, [language])

  const setLanguage = (next: Language) => {
    setLanguageState(next)
  }

  const t = useMemo(() => {
    const dict = dictionaries[language]

    const resolve = (obj: Dictionary, path: string): string | undefined => {
      const parts = path.split('.')
      let current: string | Dictionary | undefined = obj
      for (const part of parts) {
        if (!current || typeof current === 'string') return undefined
        current = current[part]
      }
      return typeof current === 'string' ? current : undefined
    }

    return (key: string) => resolve(dict, key) ?? key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
