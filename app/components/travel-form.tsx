'use client';

import { useActionState } from 'react';
import { generateTravelAdviceAction, type PlanActionState } from '@/app/actions';

const initialState: PlanActionState = { status: 'idle', message: 'Generate weather-aware route guidance for monsoon travel.' };

interface TravelFormProps {
  defaultCity?: string;
  defaultRoute?: string;
  defaultMode?: string;
  defaultLanguage?: string;
}

export function TravelForm({
  defaultCity = 'Bengaluru',
  defaultRoute = 'Koramangala to Whitefield',
  defaultMode = 'Car',
  defaultLanguage = 'English'
}: TravelFormProps) {
  const [state, formAction, pending] = useActionState(generateTravelAdviceAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-3xl border border-[color:var(--outline-variant)] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <h2 className="text-2xl font-bold text-[color:var(--foreground)]">Travel advisory generator</h2>
      
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono uppercase text-[color:var(--muted)] pl-1">City</label>
        <input name="city" defaultValue={defaultCity} className="input" placeholder="City" required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono uppercase text-[color:var(--muted)] pl-1">Route</label>
        <input name="route" defaultValue={defaultRoute} className="input" placeholder="Route" required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono uppercase text-[color:var(--muted)] pl-1">Transport Mode</label>
        <select name="mode" defaultValue={defaultMode} className="input">
          <option>Walking</option>
          <option>Bike</option>
          <option>Car</option>
          <option>Bus</option>
          <option>Train</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono uppercase text-[color:var(--muted)] pl-1">Preferred Language</label>
        <select name="language" defaultValue={defaultLanguage} className="input">
          <option>English</option>
          <option>Hindi</option>
          <option>Kannada</option>
          <option>Tamil</option>
        </select>
      </div>

      <p aria-live="polite" className={`rounded-2xl border p-3 text-sm ${state.status === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)] text-[color:var(--muted)]'}`}>{state.message}</p>
      
      <button disabled={pending} className="rounded-2xl bg-[color:var(--foreground)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
        {pending ? 'Generating...' : 'Generate travel advisory'}
      </button>
    </form>
  );
}
