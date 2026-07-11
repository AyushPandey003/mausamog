'use client';

import { useActionState } from 'react';
import { generateTravelAdviceAction, type PlanActionState } from '@/app/actions';
import { ActionStatusMessage } from '@/app/components/action-status-message';
import { DEFAULT_PROFILE, LANGUAGE_OPTIONS, TRANSPORT_MODE_OPTIONS } from '@/lib/form-options';

const initialState: PlanActionState = { status: 'idle', message: 'Generate weather-aware route guidance for monsoon travel.' };

interface TravelFormProps {
  defaultCity?: string;
  defaultRoute?: string;
  defaultMode?: string;
  defaultLanguage?: string;
}

export function TravelForm({
  defaultCity = DEFAULT_PROFILE.city,
  defaultRoute = DEFAULT_PROFILE.travelRoute,
  defaultMode = DEFAULT_PROFILE.travelMode,
  defaultLanguage = DEFAULT_PROFILE.language,
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
          {TRANSPORT_MODE_OPTIONS.map((mode) => (
            <option key={mode}>{mode}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono uppercase text-[color:var(--muted)] pl-1">Preferred Language</label>
        <select name="language" defaultValue={defaultLanguage} className="input">
          {LANGUAGE_OPTIONS.map((language) => (
            <option key={language}>{language}</option>
          ))}
        </select>
      </div>

      <ActionStatusMessage state={state} />
      
      <button disabled={pending} className="rounded-2xl bg-[color:var(--foreground)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
        {pending ? 'Generating...' : 'Generate travel advisory'}
      </button>
    </form>
  );
}
