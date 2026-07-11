import { getHomeData, toggleChecklistAction } from '@/app/actions';
import { PlanForm } from '@/app/components/plan-form';

function severityTone(severity: string) {
  if (severity === 'high') return 'border-red-200 bg-red-50 text-red-800';
  if (severity === 'moderate') return 'border-amber-200 bg-amber-50 text-amber-900';
  return 'border-sky-200 bg-sky-50 text-sky-900';
}

export default async function HomePage() {
  const { city, plan, alerts, checklist, resources, user } = await getHomeData();

  const completedCount = checklist.filter((item) => item.done).length;
  const totalCount = checklist.length;
  const readinessScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Top Banner section */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card bg-[linear-gradient(135deg,#131b2e,#1c2940)] text-white relative overflow-hidden flex flex-col justify-between p-6 shadow-lg min-h-[300px]">
          {/* Abstract weather icon background */}
          <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none">
            <span className="text-9xl">⛈️</span>
          </div>

          <div className="relative z-10">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#ffb690]">Sentinel Flux Command Center</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight">
              Hello, {user?.fullName || 'Citizen'}!
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              MausamOG combines preparedness planning, localized alerts, multilingual assistant, checklist progress, and travel guidance in one GenAI-powered interface.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3 relative z-10">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Readiness</span>
              <div className="mt-2 flex items-baseline gap-1">
                <strong className="text-3xl font-bold">{readinessScore}%</strong>
                <span className="text-xs text-slate-400">score</span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Current City</span>
              <strong className="mt-2 block text-2xl font-bold tracking-tight">{city}</strong>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
              <span className="text-xs uppercase tracking-[0.16em] text-slate-400">Active Alerts</span>
              <strong className="mt-2 block text-2xl font-bold text-amber-400">{alerts.length}</strong>
            </div>
          </div>
        </div>
        
        <PlanForm />
      </section>

      {/* Bento grid detailed modules */}
      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-6">
          {/* AI Plan Section */}
          <article className="card shadow-md border-[color:var(--outline-variant)] bg-white p-6 relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-[color:var(--outline-variant)]/40 pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold">AI Preparedness Plan</p>
                <h3 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">
                  {plan?.plan.riskSummary ?? 'Configure your profile above to generate a custom AI monsoon plan.'}
                </h3>
              </div>
              <span className="rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                {plan?.source ?? 'pending'}
              </span>
            </div>
            {plan ? (
              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <div className="bg-[color:var(--surface-soft)]/50 rounded-2xl p-4 border border-[color:var(--outline-variant)]/30">
                  <h4 className="font-bold text-sm text-[color:var(--foreground)] flex items-center gap-1.5 mb-3">
                    <span>📋</span> Before Monsoon
                  </h4>
                  <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                    {plan.plan.beforeMonsoon.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-[color:var(--accent)]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[color:var(--surface-soft)]/50 rounded-2xl p-4 border border-[color:var(--outline-variant)]/30">
                  <h4 className="font-bold text-sm text-[color:var(--foreground)] flex items-center gap-1.5 mb-3">
                    <span>🧰</span> Emergency Kit
                  </h4>
                  <ul className="space-y-2 text-sm text-[color:var(--muted)]">
                    {plan.plan.emergencyKit.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-[color:var(--accent)]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </article>

          {/* Checklist Progress Tracker */}
          <article className="card shadow-md">
            <div className="flex items-center justify-between gap-4 border-b border-[color:var(--outline-variant)]/40 pb-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--sky)] font-semibold">Interactive Checklist</p>
                <h3 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">Emergency Readiness Tracker</h3>
              </div>
              <span className="rounded-full bg-[color:var(--surface-soft)] px-3 py-1.5 text-sm font-semibold text-[color:var(--muted)]">
                {completedCount}/{totalCount} done
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {checklist.length === 0 ? (
                <p className="text-sm text-[color:var(--muted)] py-4 text-center">No checklist items generated yet. Generate your preparedness plan to get started.</p>
              ) : (
                checklist.map((item) => (
                  <form key={item.itemKey} action={toggleChecklistAction} className="flex items-start gap-3 rounded-2xl border border-[color:var(--outline-variant)]/60 bg-[color:var(--surface-soft)]/40 p-4 transition hover:bg-[color:var(--surface-soft)]">
                    <input type="hidden" name="city" value={item.city} />
                    <input type="hidden" name="itemKey" value={item.itemKey} />
                    <button className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-xs transition-colors ${item.done ? 'border-[color:var(--accent)] bg-[color:var(--accent)] text-white' : 'border-[color:var(--outline)] bg-white text-transparent hover:border-[color:var(--accent)]'}`}>✓</button>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${item.done ? 'text-[color:var(--outline)] line-through' : 'text-[color:var(--foreground)]'}`}>{item.label}</p>
                      <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.1em] text-[color:var(--muted)]">{item.category} · {item.priority}</p>
                    </div>
                  </form>
                ))
              )}
            </div>
          </article>
        </div>

        {/* Sidebar Info Panels */}
        <aside className="grid gap-6">
          {/* Alerts Panel */}
          <section className="card shadow-md">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold mb-4">Live Alerts</p>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-sm text-[color:var(--muted)] py-2">No active alerts for {city}.</p>
              ) : (
                alerts.map((alert) => (
                  <div key={`${alert.city}-${alert.title}`} className={`rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${severityTone(alert.severity)}`}>
                    <h4 className="font-bold text-sm">{alert.title}</h4>
                    <p className="mt-2 text-xs leading-5 opacity-90">{alert.summary}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Local Resources Panel */}
          <section className="card shadow-md">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--sky)] font-semibold mb-4">Community Assistance Hub</p>
            <div className="space-y-3">
              {resources.length === 0 ? (
                <p className="text-sm text-[color:var(--muted)] py-2">No emergency resources cataloged for {city}.</p>
              ) : (
                resources.map((resource) => (
                  <div key={`${resource.city}-${resource.name}`} className="rounded-2xl border border-[color:var(--outline-variant)]/60 bg-[color:var(--surface-soft)]/30 p-4 transition hover:bg-[color:var(--surface-soft)]/60">
                    <h4 className="font-bold text-sm text-[color:var(--foreground)]">{resource.name}</h4>
                    <p className="mt-1 text-xs text-[color:var(--muted)]">{resource.kind} · {resource.openStatus}</p>
                    <p className="mt-2 text-xs text-[color:var(--muted)] leading-relaxed">{resource.address}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-mono font-semibold text-[color:var(--foreground)]">{resource.phone}</span>
                      <a href={`tel:${resource.phone}`} className="rounded-lg bg-[color:var(--surface-soft)] hover:bg-[color:var(--outline-variant)]/30 px-2 py-1 text-[10px] font-bold text-[color:var(--foreground)] transition">
                        Call
                      </a>
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
