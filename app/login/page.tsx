'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { loginAction, type PlanActionState } from '@/app/actions';

const initialState: PlanActionState = { status: 'idle', message: '' };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[color:var(--background)]">
      <div className="absolute inset-0 z-0 opacity-20">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAF8oEVN7MMNMAGwAkSdq50LIRd1GcsZT96kE_hNoIF1TcNtXa_duD8VocAP_FDt4JpnxjdP86UJoiJ4Ag5nPw5CNP-OOj5Lq0H5SkFVja5DPRuKiMqO8xO_6uUPiu_SyCw9zXBxiYZv-67kCf3b5d6ix5ihxghuHq1jHFAnxMYKx3AMAqxd82vSAw9V2FgVHaFRDZY0cstXKXh4Emd2GTRHuZnqoCRDCpSUj4rU2Ucc-uSdm5XTm6slO7QK6ZK1ZiXHRVep8gTTgU')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--background)] via-[color:var(--background)] to-[color:var(--navy)]/30 mix-blend-multiply" />
      </div>

      <main className="relative z-10 w-full max-w-[440px] px-4">
        <div className="flex flex-col gap-6 rounded-3xl border border-[color:var(--outline-variant)] bg-white/90 p-6 shadow-xl backdrop-blur-xl md:p-8">
          <div className="flex flex-col items-center gap-3 border-b border-[color:var(--outline-variant)]/40 pb-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--navy)] shadow-sm">
              <span className="text-2xl font-semibold text-white">M</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[color:var(--foreground)]">MausamOG</h1>
              <p className="mt-1 text-sm text-[color:var(--muted)]">Passwordless command center login</p>
            </div>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[color:var(--foreground)]" htmlFor="email">
                Email Address
              </label>
              <input className="input w-full" id="email" name="email" placeholder="citizen@mausamog.gov" required type="email" />
            </div>

            {state.message && (
              <div className={`rounded-xl border p-3 text-sm ${state.status === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                <p>{state.message}</p>
                {state.magicLink && (
                  <a className="mt-2 block break-all font-semibold underline" href={state.magicLink}>
                    {state.magicLink}
                  </a>
                )}
              </div>
            )}

            <button
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--accent-strong)]"
              disabled={pending}
              type="submit"
            >
              {pending ? 'Preparing link...' : 'Send magic link'}
              <span aria-hidden="true">-&gt;</span>
            </button>
          </form>

          <p className="text-center text-sm text-[color:var(--muted)]">
            New to MausamOG?{' '}
            <Link className="font-bold text-[color:var(--accent)] hover:underline" href="/register">
              Create a safety profile
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
