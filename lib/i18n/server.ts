import { createInstance } from 'i18next';
import { cookies } from 'next/headers';
import { DEFAULT_LANGUAGE, LANGUAGE_COOKIE, isSupportedLanguage, resources, type SupportedLanguage } from './resources';

export async function getRequestLanguage(): Promise<SupportedLanguage> {
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE)?.value;
  return isSupportedLanguage(cookieLanguage) ? cookieLanguage : DEFAULT_LANGUAGE;
}

export async function getServerTranslation(language?: SupportedLanguage) {
  const lng = language ?? (await getRequestLanguage());
  const i18n = createInstance();

  await i18n.init({
    lng,
    fallbackLng: DEFAULT_LANGUAGE,
    resources,
    interpolation: { escapeValue: false },
  });

  return {
    language: lng,
    t: i18n.t.bind(i18n),
  };
}
