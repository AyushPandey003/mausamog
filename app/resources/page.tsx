import type { Metadata } from 'next';
import Link from 'next/link';
import { getResources, getLatestPlan } from '@/lib/repository';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Find shelters, hospitals, helpdesks, and emergency contact resources available in your city during monsoon events and flood-risk situations.',
  alternates: {
    canonical: '/resources',
  },
  openGraph: {
    title: 'MausamOG Resources',
    description: 'Browse emergency shelters, hospitals, and citizen assistance resources for monsoon safety and disaster response.',
    url: '/resources',
  },
  twitter: {
    title: 'MausamOG Resources',
    description: 'Browse emergency shelters, hospitals, and citizen assistance resources for monsoon safety and disaster response.',
  },
};

export default async function ResourcesPage() {
  const { t } = await getServerTranslation();
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const plan = await getLatestPlan(user.id);
  const city = plan?.input.city ?? 'Bengaluru';
  const resources = await getResources(city);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="card shadow-md">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold">{t('resources.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[color:var(--foreground)]">{t('resources.title')}</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t('resources.intro', { city })}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)]/35 p-5 text-center">
              <p className="text-sm text-[color:var(--muted)]">{t('resources.empty', { city })}</p>
              <div className="mt-4 flex justify-center gap-2">
                <Link href="/alerts" className="rounded-xl bg-[color:var(--sky)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                  Open alerts map
                </Link>
              </div>
            </div>
          ) : (
            resources.map((resource) => {
              const isHospital = resource.kind.toLowerCase().includes('hospital');
              const isShelter = resource.kind.toLowerCase().includes('shelter');
              const tagClass = isHospital
                ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20'
                : isShelter
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20';
                  
              return (
                <article key={resource.name} className="rounded-3xl border border-[color:var(--outline-variant)]/50 bg-[color:var(--surface-soft)]/20 p-5 flex flex-col justify-between hover:bg-[color:var(--surface-soft)]/40 hover:border-[color:var(--accent)]/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                  <div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-[0.14em] font-bold ${tagClass}`}>
                      {resource.kind}
                    </span>
                    <h2 className="mt-3 text-lg font-bold text-[color:var(--foreground)] leading-snug tracking-tight">{resource.name}</h2>
                    <p className="mt-3 text-xs leading-5 text-[color:var(--muted)]">{resource.address}</p>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-2 border-t border-outline-variant/30 pt-3">
                      <span className="text-xs font-mono font-semibold text-[color:var(--foreground)]">{resource.phone}</span>
                      <a href={`tel:${resource.phone}`} className="rounded-xl bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-strong)] px-3.5 py-1.5 text-xs font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-sm">
                      {t('common.call')}
                      </a>
                    </div>
                    <div className="mt-3 rounded-2xl bg-surface-soft border border-[color:var(--outline-variant)]/20 px-3 py-1.5 text-xs text-[color:var(--muted)] text-center font-medium">
                      {resource.openStatus}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
