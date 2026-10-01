import { createContext, useContext } from 'react'

export const ContentLanguageContext = createContext<string>('')

export function useContentLanguage() {
  return useContext(ContentLanguageContext)
}
