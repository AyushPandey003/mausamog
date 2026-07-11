import type { Metadata } from 'next';
import Link from 'next/link';
import { getHomeData, toggleChecklistAction } from '@/app/actions';
import { PlanForm } from '@/app/components/plan-form';
import { getServerTranslation } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Generate personalized monsoon preparedness plans, monitor active alerts, track emergency checklist progress, and access local safety resources from the MausamOG dashboard.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MausamOG Dashboard',
    description: 'A monsoon safety dashboard with AI preparedness plans, alerts, checklist tracking, and local emergency support.',
    url: '/',
  },
  twitter: {
    title: 'MausamOG Dashboard',
    description: 'A monsoon safety dashboard with AI preparedness plans, alerts, checklist tracking, and local emergency support.',
  },
};

function severityTone(severity: string) {
  if (severity === 'high') return 'border-red-200 bg-red-50 text-red-800';
  if (severity === 'moderate') return 'border-amber-200 bg-amber-50 text-amber-900';
  return 'border-sky-200 bg-sky-50 text-sky-900';
}

export default async function HomePage() {
  const { t } = await getServerTranslation();
  const { city, plan, alerts, checklist, resources, user } = await getHomeData();

  const completedCount = checklist.filter((item) => item.done).length;
  const totalCount = checklist.length;
  const readinessScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#131b2e,#1c2940)] text-white relative overflow-hidden flex flex-col justify-between p-6 shadow-lg min-h-[300px]">
          <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
            <span className="text-7xl font-black tracking-widest">RAIN</span>
          </div>

          <div className="relative z-10">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#ffb690]">{t('dashboard.commandCenter')}</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight">
              {t('dashboard.hello', { name: user?.fullName || t('dashboard.citizen') })}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {t('dashboard.intro')}
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3 relative z-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{t('dashboard.readiness')}</span>
              <div className="mt-2 flex items-baseline gap-1">
                <strong className="text-3xl font-bold">{readinessScore}%</strong>
                <span className="text-xs text-slate-400">{t('common.score')}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{t('dashboard.currentCity')}</span>
              <strong className="mt-2 block text-2xl font-bold tracking-tight">{city}</strong>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-400">{t('dashboard.activeAlerts')}</span>
              <strong className="mt-2 block text-2xl font-bold text-amber-400">{alerts.length}</strong>
            </div>
          </div>
        </div>

        <PlanForm />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-6">
          <article className="card shadow-md border-[color:var(--outline-variant)] bg-white p-6 relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-[color:var(--outline-variant)]/40 pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold">{t('dashboard.aiPlan')}</p>
                <h2 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">
                  {plan?.plan.riskSummary ?? t('dashboard.noPlan')}
                </h2>
              </div>
              <span className="rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                {plan?.source ?? t('common.pending')}
              </span>
            </div>
            {plan ? (
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <div className="bg-[color:var(--surface-soft)]/50 rounded-2xl p-4 border border-[color:var(--outline-variant)]/30">
                  <h3 className="font-bold text-sm text-[color:var(--foreground)] flex items-center gap-1.5 mb-3">
                    <span className="font-mono text-xs uppercase text-[color:var(--accent)]">Plan</span> {t('dashboard.beforeMonsoon')}
                  </h3>
                  <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                    {plan.plan.beforeMonsoon.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-[color:var(--accent)]">-</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[color:var(--surface-soft)]/50 rounded-2xl p-4 border border-[color:var(--outline-variant)]/30">
                  <h3 className="font-bold text-sm text-[color:var(--foreground)] flex items-center gap-1.5 mb-3">
                    <span className="font-mono text-xs uppercase text-[color:var(--accent)]">Kit</span> {t('dashboard.emergencyKit')}
                  </h3>
                  <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                    {plan.plan.emergencyKit.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-[color:var(--accent)]">-</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </article>

          <article className="card shadow-md">
            <div className="flex items-center justify-between gap-4 border-b border-[color:var(--outline-variant)]/40 pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--sky)] font-semibold">{t('dashboard.checklistEyebrow')}</p>
                <h2 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">{t('dashboard.checklistTitle')}</h2>
              </div>
              <span className="rounded-full bg-[color:var(--surface-soft)] px-3 py-1.5 text-sm font-semibold text-[color:var(--muted)]">
                {completedCount}/{totalCount} {t('common.done')}
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {checklist.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)]/35 p-5 text-center">
                  <p className="text-sm text-[color:var(--muted)]">{t('dashboard.noChecklist')}</p>
                  <div className="mt-4 flex justify-center">
                    <Link href="/" className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                      Generate preparedness plan
                    </Link>
                  </div>
                </div>
              ) : (
                checklist.map((item) => (
                  <form key={item.itemKey} action={toggleChecklistAction} className="flex items-start gap-3 rounded-2xl border border-[color:var(--outline-variant)]/50 bg-[color:var(--surface-soft)]/30 p-4 transition-all duration-300 hover:bg-[color:var(--surface-soft)]/60 hover:-translate-y-0.5 hover:shadow-sm hover:border-[color:var(--accent)]/30">
                    <input type="hidden" name="city" value={item.city} />
                    <input type="hidden" name="itemKey" value={item.itemKey} />
                    <button className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 cursor-pointer ${item.done ? 'border-[color:var(--accent)] bg-[color:var(--accent)] text-white scale-110 shadow-sm shadow-orange-500/20' : 'border-slate-300 bg-white text-transparent hover:border-[color:var(--accent)] hover:scale-105'}`}>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold leading-snug ${item.done ? 'text-[color:var(--outline)] line-through' : 'text-[color:var(--foreground)]'}`}>{item.label}</p>
                      <p className="mt-1.5 text-[9px] font-mono uppercase tracking-[0.12em] text-[color:var(--muted)]">{item.category} | {item.priority}</p>
                    </div>
                  </form>
                ))
              )}
            </div>
          </article>
        </div>

        <aside className="grid gap-6">
          <section className="card shadow-md">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold mb-4">{t('dashboard.liveAlerts')}</p>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)]/35 p-4 text-center">
                  <p className="text-sm text-[color:var(--muted)]">{t('dashboard.noAlerts', { city })}</p>
                  <div className="mt-3 flex justify-center">
                    <Link href="/alerts" className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                      Open alerts map
                    </Link>
                  </div>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div key={`${alert.city}-${alert.title}`} className={`rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${severityTone(alert.severity)}`}>
                    <h3 className="font-bold text-sm">{alert.title}</h3>
                    <p className="mt-2 text-xs leading-5 opacity-90">{alert.summary}</p>
                    <Link href="/alerts" className="mt-3 inline-flex rounded-lg border border-current/20 bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-white">
                      {t('common.openMap')}
                    </Link>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card shadow-md">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--sky)] font-semibold mb-4">{t('dashboard.communityHub')}</p>
            <div className="space-y-3">
              {resources.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)]/35 p-4 text-center">
                  <p className="text-sm text-[color:var(--muted)]">{t('dashboard.noResources', { city })}</p>
                  <div className="mt-3 flex justify-center">
                    <Link href="/resources" className="rounded-xl bg-[color:var(--sky)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90">
                      Open resource hub
                    </Link>
                  </div>
                </div>
              ) : (
                resources.map((resource) => (
                  <div key={`${resource.city}-${resource.name}`} className="rounded-2xl border border-[color:var(--outline-variant)]/60 bg-[color:var(--surface-soft)]/30 p-4 transition hover:bg-[color:var(--surface-soft)]/60">
                    <h3 className="font-bold text-sm text-[color:var(--foreground)]">{resource.name}</h3>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">{resource.kind} | {resource.openStatus}</p>
                    <p className="mt-2 text-xs text-[color:var(--muted)] leading-relaxed">{resource.address}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-semibold text-[color:var(--foreground)]">{resource.phone}</span>
                      <div className="flex items-center gap-2">
                        <Link href="/resources" className="rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-[color:var(--foreground)] transition hover:bg-[color:var(--outline-variant)]/15">
                          {t('common.viewHub')}
                        </Link>
                        <a href={`tel:${resource.phone}`} className="rounded-lg bg-[color:var(--surface-soft)] hover:bg-[color:var(--outline-variant)]/30 px-2 py-1 text-[10px] font-bold text-[color:var(--foreground)] transition">
                          {t('common.call')}
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
