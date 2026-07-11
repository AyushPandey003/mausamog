import { getAlerts, getLatestPlan } from '@/lib/repository';
import { AlertsMap } from '@/app/components/alerts-map';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AlertsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const plan = await getLatestPlan(user.id);
  const city = plan?.input.city ?? 'Bengaluru';
  const alerts = await getAlerts(city);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:grid-cols-[1.25fr_0.75fr]">
      <section className="card min-h-[480px] overflow-hidden bg-[linear-gradient(135deg,#eaf4ff,#f7f9fb)] shadow-md">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--sky)] font-semibold">Interactive risk map</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[color:var(--foreground)]">Risk zones and alert overlays</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
          Interactive Mapbox view centered on <strong>{city}</strong> showing active risk areas and seeded local resources.
        </p>
        <div className="mt-6 h-full min-h-[360px] rounded-2xl overflow-hidden border border-[color:var(--outline-variant)]">
          <AlertsMap city={city} alerts={alerts} />
        </div>
      </section>
      <aside className="card shadow-md">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold">Active alert stack</p>
        <h2 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">Monsoon Warnings</h2>
        <p className="mt-1 text-xs text-[color:var(--muted)]">Live feeds filtered for {city}</p>
        <div className="mt-6 space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)] py-4 text-center">No active alerts for {city} at this time.</p>
          ) : (
            alerts.map((alert) => (
              <div key={alert.title} className="rounded-2xl border border-[color:var(--outline-variant)]/60 bg-[color:var(--surface-soft)]/45 p-4 transition hover:bg-[color:var(--surface-soft)]">
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[color:var(--accent)] font-bold">{alert.severity}</p>
                <h3 className="mt-1 text-base font-bold text-[color:var(--foreground)]">{alert.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{alert.summary}</p>
                <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.1em] text-[color:var(--muted)]">{alert.meta.zone ?? city} · {alert.meta.window ?? 'Active'}</p>
              </div>
            ))
          )}
        </div>
      </aside>
    </main>
  );
}
