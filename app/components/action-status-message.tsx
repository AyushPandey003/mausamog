import type { PlanActionState } from '@/app/actions';

type ActionStatusMessageProps = {
  state: PlanActionState;
  idleTone?: 'neutral' | 'success';
};

export function ActionStatusMessage({ state, idleTone = 'neutral' }: ActionStatusMessageProps) {
  if (!state.message) return null;

  const toneClass =
    state.status === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : idleTone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)] text-[color:var(--muted)]';

  return (
    <div aria-live="polite" className={`rounded-2xl border p-3 text-sm ${toneClass}`}>
      <p>{state.message}</p>
      {state.magicLink ? (
        <a className="mt-2 block break-all font-semibold underline" href={state.magicLink}>
          {state.magicLink}
        </a>
      ) : null}
    </div>
  );
}
