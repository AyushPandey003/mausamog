'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { getClientI18n } from '@/lib/i18n/client';
import {
  LANGUAGE_COOKIE,
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
  type SupportedLanguage,
} from '@/lib/i18n/resources';

type I18nProviderProps = {
  initialLanguage: SupportedLanguage;
  children: ReactNode;
};

export function I18nProvider({ initialLanguage, children }: I18nProviderProps) {
  const [language] = useState<SupportedLanguage>(() => {
    if (typeof window === 'undefined') return initialLanguage;
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? undefined;
    if (isSupportedLanguage(storedLanguage)) {
      return storedLanguage;
    }
    return initialLanguage;
  });
  const i18n = getClientI18n(language);

  useEffect(() => {
    document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = language;
  }, [language]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
