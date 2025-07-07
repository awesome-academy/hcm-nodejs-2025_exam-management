import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viAuth from './vi/auth.json';
import viCommon from './vi/common.json';
import enAuth from './en/auth.json';
import enCommon from './en/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        auth: viAuth,
        common: viCommon,
      },
      en: {
        auth: enAuth,
        common: enCommon,
      },
    },
    fallbackLng: 'vi', 
    ns: ['auth', 'common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, 
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
