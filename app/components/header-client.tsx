'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { logoutAction } from '@/app/actions';
import { LanguageSwitcher } from './language-switcher';

type HeaderUser = {
  fullName: string;
  email: string;
};

type HeaderClientProps = {
  user: HeaderUser;
};

const links = [
  { href: '/', labelKey: 'nav.dashboard' },
  { href: '/alerts', labelKey: 'nav.alerts' },
  { href: '/checklist', labelKey: 'nav.checklist' },
  { href: '/travel', labelKey: 'nav.travel' },
  { href: '/assistant', labelKey: 'nav.assistant' },
  { href: '/resources', labelKey: 'nav.resources' },
] as const;

export function HeaderClient({ user }: HeaderClientProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const initials = user.fullName
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--outline-variant)] bg-[rgba(247,249,251,0.92)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0 flex-1">
            <Link href="/" className="inline-block">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]">{t('common.appName')}</p>
              <h1 className="max-w-xl text-lg font-bold text-[color:var(--foreground)] md:text-xl">
                {t('common.tagline')}
              </h1>
            </Link>
          </div>

          <div className="flex flex-col gap-3 xl:items-end">
            <nav className="flex flex-wrap gap-2">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'border border-[color:var(--accent)] bg-orange-50 text-[color:var(--foreground)] shadow-sm'
                        : 'border border-[color:var(--outline-variant)] bg-white text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]'
                    }`}
                  >
                    {t(link.labelKey)}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-wrap items-center gap-3 xl:justify-end">
              <LanguageSwitcher compact />

              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[color:var(--outline-variant)] bg-white px-3 py-2 shadow-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--navy)] text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight text-[color:var(--foreground)]">{user.fullName}</p>
                  <p className="truncate text-xs text-[color:var(--muted)]">{user.email}</p>
                </div>
              </div>

              <form action={logoutAction}>
                <button className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:scale-[0.99]">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15l3-3m0 0l-3-3m3 3H8.25" />
                  </svg>
                  <span>{t('nav.signOut')}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
