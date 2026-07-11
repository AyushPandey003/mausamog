'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signupAction, type PlanActionState } from '@/app/actions';
import { ActionStatusMessage } from '@/app/components/action-status-message';

const initialState: PlanActionState = { status: 'idle', message: '' };

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <div className="relative flex min-h-screen flex-col bg-[color:var(--background)] md:flex-row">
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden border-r border-[color:var(--outline-variant)] bg-[color:var(--surface-soft)] p-12 md:flex">
        <div className="absolute inset-0 z-0 opacity-20">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAyo0OznrjavRLIdtROUYEr_WkfVBZlAvxN9rmxqzTE934fZG-3jYtd6aaSgP4eCq51AiDs1DzOF7cgBhWYVlbqOluulfmS9o7X6L3TnxRPktw4Rp_a-wOMilD_ofa4o-VfRkbI73JvgDUD9cMNXu-SBqNgTER-gkxnFWK1mFIowkAlhDmvvpwOACD2FZhr6Uu6KSQKeGQ92HGOhoSUHHg1Jg0y2SKwfoR-Jgp6WFEBYRey3Vue-FhqQvbLh9fM4R4WQB2VhTllzrc')" }}
          />
        </div>
        <div className="relative z-10 max-w-lg rounded-3xl border border-[color:var(--outline-variant)] bg-white/85 p-8 shadow-lg backdrop-blur-md">
          <h1 className="mb-4 text-3xl font-bold text-[color:var(--foreground)]">Prepare. Respond. Recover.</h1>
          <p className="mb-6 text-sm leading-6 text-[color:var(--muted)]">
            Create a passwordless safety profile for local alerts, AI preparedness plans, emergency checklists, and travel guidance.
          </p>
          <ul className="space-y-4">
            <li>
              <h3 className="font-semibold text-[color:var(--foreground)]">Localized risk assessments</h3>
              <p className="text-xs text-[color:var(--muted)]">Keep monsoon guidance tied to your primary city and household needs.</p>
            </li>
            <li>
              <h3 className="font-semibold text-[color:var(--foreground)]">AI safety assistant</h3>
              <p className="text-xs text-[color:var(--muted)]">Ask for practical next steps before, during, and after severe rain.</p>
            </li>
            <li>
              <h3 className="font-semibold text-[color:var(--foreground)]">No password to manage</h3>
              <p className="text-xs text-[color:var(--muted)]">Sign in with one-time email links backed by server-side sessions.</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center bg-white p-6 md:w-1/2 md:p-12">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[color:var(--foreground)]">Create your account</h2>
            <p className="mt-1 text-sm text-[color:var(--muted)]">We will email a one-time link to finish setup.</p>
          </div>

          <form action={formAction} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-wider text-[color:var(--foreground)]" htmlFor="fullName">
                Full Name
              </label>
              <input className="input w-full" id="fullName" name="fullName" placeholder="Jane Doe" required type="text" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-wider text-[color:var(--foreground)]" htmlFor="email">
                Email Address
              </label>
              <input className="input w-full" id="email" name="email" placeholder="jane@example.com" required type="email" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-xs uppercase tracking-wider text-[color:var(--foreground)]" htmlFor="city">
                Primary Location
              </label>
              <input className="input w-full" id="city" name="city" placeholder="Bengaluru" required type="text" />
              <p className="mt-1 text-xs text-[color:var(--muted)]">Used for weather alerts, checklist defaults, and travel guidance.</p>
            </div>

            <ActionStatusMessage state={state} idleTone="success" />

            <button
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] font-semibold text-white transition-colors hover:bg-[color:var(--accent-strong)]"
              disabled={pending}
              type="submit"
            >
              {pending ? 'Preparing link...' : 'Email signup link'}
              <span aria-hidden="true">-&gt;</span>
            </button>

            <p className="mt-4 text-center text-sm text-[color:var(--muted)]">
              Already have a profile?{' '}
              <Link className="font-bold text-[color:var(--accent)] hover:underline" href="/login">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
