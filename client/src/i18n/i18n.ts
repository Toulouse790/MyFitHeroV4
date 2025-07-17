import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des traductions
import enCommon from '../locales/en/common.json';
import enOnboarding from '../locales/en/onboarding.json';
import frCommon from '../locales/fr/common.json';
import frOnboarding from '../locales/fr/onboarding.json';

const resources = {
  en: {
    common: enCommon,
    onboarding: enOnboarding,
  },
  fr: {
    common: frCommon,
    onboarding: frOnboarding,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    // Détection automatique de la langue
    detection: {
      order: ['navigator', 'localStorage', 'sessionStorage', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'sessionStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupSessionStorage: 'i18nextLng',
      checkWhitelist: true,
    },

    interpolation: {
      escapeValue: false, // React s'occupe de l'échappement
    },

    // Configuration des namespaces
    defaultNS: 'common',
    ns: ['common', 'onboarding'],

    // Configuration du cache
    cache: {
      enabled: true,
      prefix: 'i18next_res_',
      expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 jours
      versions: {
        en: '1.0.0',
        fr: '1.0.0',
      },
    },

    // Gestion des clés manquantes
    missingKeyHandler: (lng, ns, key, fallbackValue) => {
      console.warn(`Missing translation: ${ns}:${key} for language: ${lng}`);
    },

    // Formatage des valeurs
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n;
