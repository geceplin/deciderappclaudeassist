
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation modules directly with explicit extensions
import en from './locales/en.ts';
import es from './locales/es.ts';
import pt from './locales/pt.ts';

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      pt: { translation: pt }
    },
    fallbackLng: 'en',
    load: 'languageOnly', // 'en-US' -> 'en'
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'decide-app-language', // Custom key for local storage
      caches: ['localStorage']
    },

    // Optional: Log missing keys in development
    debug: false,
  });

export default i18n;
