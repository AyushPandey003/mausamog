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
        className="appearance-none rounded-xl border border-[color:var(--outline-variant)] bg-white/90 pl-3 pr-8 py-2 text-xs font-semibold text-[color:var(--foreground)] shadow-sm outline-none transition focus:border-[color:var(--accent)] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2345464d%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] bg-[size:16px_16px] cursor-pointer"
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
