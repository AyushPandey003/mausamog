import { getTravelData } from '@/app/actions';
import { getLatestPlan } from '@/lib/repository';
import { TravelForm } from '@/app/components/travel-form';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function TravelPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const { advisory } = await getTravelData();
  const plan = await getLatestPlan(user.id);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:grid-cols-[0.9fr_1.1fr]">
      <TravelForm
        defaultCity={plan?.input.city}
        defaultRoute={plan?.input.travelRoute}
        defaultMode={plan?.input.travelMode}
        defaultLanguage={plan?.input.language}
      />
      <section className="card shadow-md flex flex-col justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--sky)] font-semibold border-b border-[color:var(--outline-variant)]/40 pb-4 mb-4">Latest travel advisory</p>
          {advisory ? (
            <>
              <h2 className="text-2xl font-bold leading-tight text-[color:var(--foreground)]">{advisory.result.summary}</h2>
              <div className="mt-4 inline-flex rounded-full border border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                {advisory.result.riskRating} risk
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="bg-[color:var(--surface-soft)]/50 border border-[color:var(--outline-variant)]/40 rounded-2xl p-4">
                  <h3 className="font-bold text-sm text-[color:var(--foreground)]">Safer timing</h3>
                  <p className="mt-2 text-xs leading-5 text-[color:var(--muted)]">{advisory.result.saferTiming}</p>
                </div>
                <div className="bg-[color:var(--surface-soft)]/50 border border-[color:var(--outline-variant)]/40 rounded-2xl p-4">
                  <h3 className="font-bold text-sm text-[color:var(--foreground)]">Carry items</h3>
                  <ul className="mt-2 space-y-1 text-xs text-[color:var(--muted)]">
                    {advisory.result.carryItems.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 bg-red-50/50 border border-red-200/50 rounded-2xl p-4">
                <h3 className="font-bold text-sm text-red-900">Avoid if</h3>
                <ul className="mt-2 space-y-1 text-xs text-red-800">
                  {advisory.result.avoidIf.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-sm text-[color:var(--muted)]">Generate a travel advisory to view route-specific monsoon guidance.</p>
          )}
        </div>
        <p className="text-[10px] text-[color:var(--outline)] mt-8">
          Powered by Gemini safety protocols. Always check official highway authority notifications.
        </p>
      </section>
    </main>
  );
}
