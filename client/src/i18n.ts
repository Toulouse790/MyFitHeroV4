import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des fichiers de traduction
import enCommon from './locales/en/common.json';
import enOnboarding from './locales/en/onboarding.json';
import frCommon from './locales/fr/common.json';
import frOnboarding from './locales/fr/onboarding.json';

// Configuration des ressources
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

// Configuration du système de détection
const detectionOptions = {
  // Ordre de priorité pour détecter la langue
  order: ['navigator', 'localStorage', 'sessionStorage', 'htmlTag'],

  // Langues supportées
  supportedLngs: ['en', 'fr'],

  // Langue par défaut si non détectée
  fallbackLng: 'en',

  // Clé de stockage local
  lookupLocalStorage: 'i18nextLng',

  // Ne pas utiliser les sous-domaines
  lookupFromSubdomainIndex: 0,

  // Cache dans localStorage
  caches: ['localStorage'],

  // Exclure certaines routes de la détection
  excludeCacheFor: ['cimode'],
};

// Initialisation d'i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,

    // Configuration de la détection
    detection: detectionOptions,

    // Langue par défaut
    fallbackLng: 'en',

    // Langues supportées
    supportedLngs: ['en', 'fr'],

    // Namespace par défaut
    defaultNS: 'common',

    // Debug en développement
    debug: process.env.NODE_ENV === 'development',

    // Interpolation
    interpolation: {
      escapeValue: false, // React s'occupe déjà de l'échappement
    },

    // Gestion des clés manquantes
    saveMissing: true,
    missingKeyHandler: (lng, ns, key, _fallbackValue) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} in ${lng}:${ns}`);
      }
    },

    // Réaction aux changements de langue
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i'],
    },
  });

export default i18n;
