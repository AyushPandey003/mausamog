'use client';

import { useActionState } from 'react';
import { assistantAction, type PlanActionState } from '@/app/actions';

const initialState: PlanActionState = { status: 'idle', message: 'Ask for multilingual monsoon safety guidance.' };

interface AssistantFormProps {
  sessionId: string;
  defaultCity?: string;
  defaultLanguage?: string;
}

export function AssistantForm({ sessionId, defaultCity = 'Bengaluru', defaultLanguage = 'English' }: AssistantFormProps) {
  const [state, formAction, pending] = useActionState(assistantAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-3xl border border-[color:var(--outline-variant)] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
      <input type="hidden" name="sessionId" value={sessionId} />
      <h2 className="text-2xl font-bold text-[color:var(--foreground)]">Multilingual safety assistant</h2>
      
      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono uppercase text-[color:var(--muted)] pl-1">City</label>
        <input name="city" defaultValue={defaultCity} className="input" placeholder="City" required />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono uppercase text-[color:var(--muted)] pl-1">Language</label>
        <select name="language" defaultValue={defaultLanguage} className="input">
          <option>English</option>
          <option>Hindi</option>
          <option>Kannada</option>
          <option>Tamil</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-mono uppercase text-[color:var(--muted)] pl-1">Question / Help Needed</label>
        <textarea name="prompt" rows={5} className="input min-h-24" placeholder="Ask anything about evacuation, flooding, travel, medicines, or family safety." required />
      </div>

      <p aria-live="polite" className={`rounded-2xl border p-3 text-sm ${state.status === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)] text-[color:var(--muted)]'}`}>{state.message}</p>
      
      <button disabled={pending} className="rounded-2xl bg-[color:var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)] disabled:opacity-60">
        {pending ? 'Thinking...' : 'Ask assistant'}
      </button>
    </form>
  );
}
