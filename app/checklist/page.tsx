import { toggleChecklistAction } from '@/app/actions';
import { getChecklist, getLatestPlan } from '@/lib/repository';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ChecklistPage() {
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
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold">Emergency checklist</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[color:var(--foreground)]">Track monsoon readiness progress</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Personalized checklist for <strong>{city}</strong> based on your active household profile.
        </p>
        <div className="mt-6 grid gap-3">
          {checklist.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)] py-4 text-center">No checklist items generated yet. Generate your preparedness plan on the dashboard to get started.</p>
          ) : (
            checklist.map((item) => (
              <form key={item.itemKey} action={toggleChecklistAction} className="flex items-start gap-3 rounded-2xl border border-[color:var(--outline-variant)]/60 bg-[color:var(--surface-soft)]/40 p-4 transition hover:bg-[color:var(--surface-soft)]">
                <input type="hidden" name="city" value={item.city} />
                <input type="hidden" name="itemKey" value={item.itemKey} />
                <button className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-xs transition-colors ${item.done ? 'border-[color:var(--accent)] bg-[color:var(--accent)] text-white' : 'border-[color:var(--outline)] bg-white text-transparent hover:border-[color:var(--accent)]'}`}>✓</button>
                <div>
                  <p className={`text-sm font-medium ${item.done ? 'line-through text-[color:var(--outline)]' : 'text-[color:var(--foreground)]'}`}>{item.label}</p>
                  <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.1em] text-[color:var(--muted)]">{item.category} · {item.priority}</p>
                </div>
              </form>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
