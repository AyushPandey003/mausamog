import type { Metadata } from 'next';
import { toggleChecklistAction } from '@/app/actions';
import { getChecklist, getLatestPlan } from '@/lib/repository';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getServerTranslation } from '@/lib/i18n/server';

export const metadata: Metadata = {
  title: 'Checklist',
  description: 'Track your personalized monsoon emergency checklist with task completion states for documents, medicines, power, evacuation, and home safety.',
  alternates: {
    canonical: '/checklist',
  },
  openGraph: {
    title: 'MausamOG Checklist',
    description: 'Stay prepared with a monsoon emergency checklist covering home safety, medicines, communication, and evacuation readiness.',
    url: '/checklist',
  },
  twitter: {
    title: 'MausamOG Checklist',
    description: 'Stay prepared with a monsoon emergency checklist covering home safety, medicines, communication, and evacuation readiness.',
  },
};

export default async function ChecklistPage() {
  const { t } = await getServerTranslation();
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const plan = await getLatestPlan(user.id);
  const city = plan?.input.city ?? 'Bengaluru';
  const checklist = await getChecklist(city, user.id);

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="card shadow-md">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold">{t('checklist.eyebrow')}</p>
        <h1 className="mt-2 text-3xl font-extrabold text-[color:var(--foreground)]">{t('checklist.title')}</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t('checklist.intro', { city })}
        </p>
        <div className="mt-6 grid gap-3">
          {checklist.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)] py-4 text-center">{t('checklist.empty')}</p>
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
                  <h2 className={`text-sm font-semibold leading-snug ${item.done ? 'line-through text-[color:var(--outline)]' : 'text-[color:var(--foreground)]'}`}>{item.label}</h2>
                  <p className="mt-1.5 text-[9px] font-mono uppercase tracking-[0.12em] text-[color:var(--muted)]">{item.category} | {item.priority}</p>
                </div>
              </form>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
