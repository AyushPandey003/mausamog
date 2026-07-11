'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE, resources, type SupportedLanguage } from './resources';

let initialized = false;

export function getClientI18n(initialLanguage: SupportedLanguage = DEFAULT_LANGUAGE) {
  if (!initialized) {
    initialized = true;
    void i18next.use(initReactI18next).init({
      lng: initialLanguage,
      fallbackLng: DEFAULT_LANGUAGE,
      resources,
      interpolation: { escapeValue: false },
    });
  }

  if (i18next.language !== initialLanguage) {
    void i18next.changeLanguage(initialLanguage);
  }

  return i18next;
}
