'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LANGUAGE_COOKIE,
  LANGUAGE_STORAGE_KEY,
  languageLabels,
  supportedLanguages,
  type SupportedLanguage,
} from '@/lib/i18n/resources';

type LanguageSwitcherProps = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const router = useRouter();
  const { i18n, t } = useTranslation();
  const [, startTransition] = useTransition();
  const currentLanguage = supportedLanguages.includes(i18n.language as SupportedLanguage)
    ? (i18n.language as SupportedLanguage)
    : 'en';

  function handleChange(language: SupportedLanguage) {
    document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=31536000; SameSite=Lax`;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);

    startTransition(() => {
      void i18n.changeLanguage(language);
      router.refresh();
    });
  }

  return (
    <label className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      <span className="sr-only">{t('common.switchLanguage')}</span>
      <select
        aria-label={t('common.switchLanguage')}
        className="rounded-xl border border-[color:var(--outline-variant)] bg-white/90 px-3 py-2 text-xs font-semibold text-[color:var(--foreground)] shadow-sm outline-none transition focus:border-[color:var(--accent)]"
        value={currentLanguage}
        onChange={(event) => handleChange(event.target.value as SupportedLanguage)}
      >
        {supportedLanguages.map((language) => (
          <option key={language} value={language}>
            {languageLabels[language]}
          </option>
        ))}
      </select>
    </label>
  );
}
