import { getResources, getLatestPlan } from '@/lib/repository';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ResourcesPage() {
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
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold">Local resources</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[color:var(--foreground)]">Shelters, hospitals, and emergency helpdesks</h2>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          Showing emergency facilities and contact numbers registered for <strong>{city}</strong>.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.length === 0 ? (
            <p className="text-sm text-[color:var(--muted)] py-4 text-center col-span-full">No emergency resources registered for {city}.</p>
          ) : (
            resources.map((resource) => (
              <article key={resource.name} className="rounded-3xl border border-[color:var(--outline-variant)]/60 bg-[color:var(--surface-soft)]/30 p-5 flex flex-col justify-between hover:bg-[color:var(--surface-soft)]/60 transition">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[color:var(--sky)] font-bold">{resource.kind}</p>
                  <h3 className="mt-2 text-lg font-bold text-[color:var(--foreground)] leading-snug">{resource.name}</h3>
                  <p className="mt-3 text-xs leading-5 text-[color:var(--muted)]">{resource.address}</p>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-2 border-t border-[color:var(--outline-variant)]/40 pt-3">
                    <span className="text-xs font-mono font-semibold text-[color:var(--foreground)]">{resource.phone}</span>
                    <a href={`tel:${resource.phone}`} className="rounded-lg bg-[color:var(--accent)] hover:bg-[color:var(--accent-strong)] px-2.5 py-1 text-[10px] font-bold text-white transition">
                      Call
                    </a>
                  </div>
                  <div className="mt-3 rounded-2xl bg-white border border-[color:var(--outline-variant)]/30 px-3 py-1.5 text-xs text-[color:var(--muted)] text-center">
                    {resource.openStatus}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
