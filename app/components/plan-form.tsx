'use client';

import { useActionState } from 'react';
import { generatePreparednessPlanAction, type PlanActionState } from '@/app/actions';

const initialState: PlanActionState = { status: 'idle', message: 'Generate a preparedness plan tailored to your household and city.' };

const needOptions = ['medication', 'disability support', 'pregnancy', 'power backup', 'drinking water', 'public transport'];

export function PlanForm() {
  const [state, formAction, pending] = useActionState(generatePreparednessPlanAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-3xl border border-[color:var(--outline-variant)] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)]">Preparedness profile</p>
        <h2 className="mt-2 text-2xl font-semibold text-[color:var(--foreground)]">Build your monsoon plan</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input name="city" defaultValue="Bengaluru" aria-label="City" className="input" placeholder="City" required />
        <input name="pincode" defaultValue="560034" aria-label="Pincode" className="input" placeholder="Pincode" required />
        <input name="landmark" defaultValue="Koramangala 5th Block" aria-label="Landmark" className="input sm:col-span-2" placeholder="Landmark" required />
        <select name="language" defaultValue="English" className="input">
          <option>English</option>
          <option>Hindi</option>
          <option>Kannada</option>
          <option>Tamil</option>
        </select>
        <select name="housingType" defaultValue="Apartment" className="input">
          <option>Apartment</option>
          <option>Ground-floor home</option>
          <option>Flood-prone area</option>
          <option>Rural home</option>
        </select>
        <input name="travelMode" defaultValue="Car" aria-label="Travel mode" className="input" placeholder="Travel mode" required />
        <input name="travelRoute" defaultValue="Koramangala to Whitefield" aria-label="Travel route" className="input" placeholder="Travel route" required />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <input name="adults" type="number" min={1} max={12} defaultValue={2} className="input" placeholder="Adults" />
        <input name="children" type="number" min={0} max={12} defaultValue={1} className="input" placeholder="Children" />
        <input name="elderly" type="number" min={0} max={12} defaultValue={1} className="input" placeholder="Elderly" />
        <input name="pets" type="number" min={0} max={12} defaultValue={0} className="input" placeholder="Pets" />
      </div>

      <label className="flex items-center gap-3 text-sm text-[color:var(--muted)]"><input name="floodProne" type="checkbox" className="h-4 w-4" /> This area is flood-prone</label>

      <fieldset>
        <legend className="text-sm font-semibold text-[color:var(--foreground)]">Additional needs</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {needOptions.map((option) => (
            <label key={option} className="rounded-full border border-[color:var(--outline-variant)] px-3 py-2 text-sm text-[color:var(--muted)]">
              <input type="checkbox" name="needs" value={option} className="mr-2" />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <p aria-live="polite" className={`rounded-2xl border p-3 text-sm ${state.status === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)] text-[color:var(--muted)]'}`}>
        {state.message}
      </p>

      <button disabled={pending} className="rounded-2xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)] disabled:opacity-60">
        {pending ? 'Generating...' : 'Generate preparedness plan'}
      </button>
    </form>
  );
}
