'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useTranslation } from 'react-i18next';
import { loginAction, type PlanActionState } from '@/app/actions';
import { ActionStatusMessage } from '@/app/components/action-status-message';
import { LanguageSwitcher } from '@/app/components/language-switcher';
import { supportedLanguages, type SupportedLanguage } from '@/lib/i18n/resources';

const initialState: PlanActionState = { status: 'idle', message: '' };

export function LoginClient() {
  const { i18n, t } = useTranslation();
  const currentLanguage = supportedLanguages.includes(i18n.language as SupportedLanguage)
    ? (i18n.language as SupportedLanguage)
    : 'en';
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0c101b]">
      <div className="absolute right-4 top-4 z-20">
        <LanguageSwitcher />
      </div>
      {/* Dynamic atmospheric grid backdrop */}
      <div className="absolute inset-0 z-0">
        {/* Repeating weather command grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Glowing pressure system blobs */}
        <div className="animate-float-slow absolute top-[10%] right-[10%] h-[350px] w-[350px] rounded-full bg-[color:var(--accent)]/10 blur-[100px]" />
        <div className="animate-float-reverse absolute bottom-[10%] left-[10%] h-[400px] w-[400px] rounded-full bg-[color:var(--sky)]/10 blur-[120px]" />
        
        {/* Soft center illumination overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0c101b] via-transparent to-[#131b2e]/50" />
      </div>

      <main className="relative z-10 w-full max-w-[440px] px-4">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/15 bg-white/80 p-6 shadow-2xl backdrop-blur-xl md:p-8 transition-all duration-300 hover:border-white/25">
          <div className="flex flex-col items-center gap-3 border-b border-[color:var(--outline-variant)]/40 pb-4 text-center">
            {/* Custom Weather Shield Icon */}
            <div className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--navy)] to-[#1d273d] shadow-md border border-white/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--accent)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <svg className="h-9 w-9 text-white transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 8.58" />
                <path d="M13 11l-4 6h6l-4 6" className="text-orange-400" stroke="currentColor" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[color:var(--foreground)] tracking-tight">MausamOG</h1>
              <p className="mt-1 text-sm text-[color:var(--muted)]">{t('auth.loginSubtitle')}</p>
            </div>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="locale" value={currentLanguage} />
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-[color:var(--foreground)]" htmlFor="email">
                {t('auth.emailAddress')}
              </label>
              <input 
                className="input w-full bg-white/60 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200" 
                id="email" 
                name="email" 
                placeholder="citizen@mausamog.gov" 
                required 
                type="email" 
              />
            </div>

            <ActionStatusMessage state={state} idleTone="success" />

            <button
              className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-strong)] font-semibold text-white shadow-md shadow-orange-500/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
              disabled={pending}
              type="submit"
            >
              {pending ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t('auth.preparingLink')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.sendMagicLink')}</span>
                  <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[color:var(--muted)]">
            {t('auth.newToApp')}{' '}
            <Link className="font-bold text-[color:var(--accent)] hover:underline" href="/register">
              {t('auth.createSafetyProfile')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
