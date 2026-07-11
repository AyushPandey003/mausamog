'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useTranslation } from 'react-i18next';
import { signupAction, type PlanActionState } from '@/app/actions';
import { ActionStatusMessage } from '@/app/components/action-status-message';
import { LanguageSwitcher } from '@/app/components/language-switcher';
import { supportedLanguages, type SupportedLanguage } from '@/lib/i18n/resources';

const initialState: PlanActionState = { status: 'idle', message: '' };

export function RegisterClient() {
  const { i18n, t } = useTranslation();
  const currentLanguage = supportedLanguages.includes(i18n.language as SupportedLanguage)
    ? (i18n.language as SupportedLanguage)
    : 'en';
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <div className="relative flex min-h-screen flex-col bg-[color:var(--background)] md:flex-row">
      <div className="absolute right-4 top-4 z-20">
        <LanguageSwitcher />
      </div>
      {/* Left Column: Command Center Info Panel */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden border-r border-white/10 p-12 md:flex">
        {/* Dynamic atmospheric grid backdrop */}
        <div className="absolute inset-0 z-0">
          {/* Weather satellite cloud background from Stitch */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity" 
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAF8oEVN7MMNMAGwAkSdq50LIRd1GcsZT96kE_hNoIF1TcNtXa_duD8VocAP_FDt4JpnxjdP86UJoiJ4Ag5nPw5CNP-OOj5Lq0H5SkFVja5DPRuKiMqO8xO_6uUPiu_SyCw9zXBxiYZv-67kCf3b5d6ix5ihxghuHq1jHFAnxMYKx3AMAqxd82vSAw9V2FgVHaFRDZY0cstXKXh4Emd2GTRHuZnqoCRDCpSUj4rU2Ucc-uSdm5XTm6slO7QK6ZK1ZiXHRVep8gTTgU')` }} 
          />
          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="animate-float-slow absolute top-[20%] right-[10%] h-[300px] w-[300px] rounded-full bg-[color:var(--accent)]/10 blur-[90px]" />
          <div className="animate-float-reverse absolute bottom-[20%] left-[10%] h-[350px] w-[350px] rounded-full bg-[color:var(--sky)]/10 blur-[100px]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0c101b] via-transparent to-[#131b2e]/40" />
        </div>

        <div className="relative z-10 max-w-lg rounded-3xl border border-outline-variant bg-surface-strong/85 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--navy)] to-[#1d273d] shadow-md border border-white/10 overflow-hidden">
            <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 8.58" />
              <path d="M13 11l-4 6h6l-4 6" className="text-orange-400" stroke="currentColor" fill="currentColor" />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-foreground tracking-tight">{t('auth.registerHeroTitle')}</h1>
          <p className="mb-6 text-sm leading-6 text-muted">
            {t('auth.registerHeroCopy')}
          </p>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent border border-accent/20">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{t('auth.localizedRiskTitle')}</h3>
                <p className="text-xs text-muted">{t('auth.localizedRiskCopy')}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky/15 text-sky border border-sky/20">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{t('auth.aiAssistantTitle')}</h3>
                <p className="text-xs text-muted">{t('auth.aiAssistantCopy')}</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/15 text-muted border border-outline-variant/30">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{t('auth.noPasswordTitle')}</h3>
                <p className="text-xs text-muted">{t('auth.noPasswordCopy')}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column: Clean Form Container */}
      <div className="flex w-full flex-col justify-center bg-background p-6 md:w-1/2 md:p-12">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-outline-variant bg-surface-strong p-8 shadow-xl md:p-10">
          <div className="mb-8">
            {/* Small mobile logo */}
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--navy)] to-[#1d273d] shadow-md md:hidden">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 8.58" />
                <path d="M13 11l-4 6h6l-4 6" className="text-orange-400" stroke="currentColor" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">{t('auth.createAccount')}</h2>
            <p className="mt-1.5 text-sm text-muted">{t('auth.signupCopy')}</p>
          </div>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="locale" value={currentLanguage} />
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-foreground" htmlFor="fullName">
                {t('auth.fullName')}
              </label>
              <input 
                className="input w-full bg-surface-soft focus:bg-surface-strong focus:border-accent focus:outline-none transition-all duration-200" 
                id="fullName" 
                name="fullName" 
                placeholder="Jane Doe" 
                required 
                type="text" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-foreground" htmlFor="email">
                {t('auth.emailAddress')}
              </label>
              <input 
                className="input w-full bg-surface-soft focus:bg-surface-strong focus:border-accent focus:outline-none transition-all duration-200" 
                id="email" 
                name="email" 
                placeholder="jane@example.com" 
                required 
                type="email" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs uppercase tracking-wider text-foreground" htmlFor="city">
                {t('auth.primaryLocation')}
              </label>
              <input 
                className="input w-full bg-surface-soft focus:bg-surface-strong focus:border-accent focus:outline-none transition-all duration-200" 
                id="city" 
                name="city" 
                placeholder="Bengaluru" 
                required 
                type="text" 
              />
              <p className="mt-1 text-xs text-muted">{t('auth.primaryLocationHelp')}</p>
            </div>

            <ActionStatusMessage state={state} idleTone="success" />

            <button
              className="group relative mt-6 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-accent-strong font-semibold text-white shadow-md shadow-orange-500/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
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
                  <span>{t('auth.emailSignupLink')}</span>
                  <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </>
              )}
            </button>

            <p className="mt-6 text-center text-sm text-muted">
              {t('auth.alreadyHaveProfile')}{' '}
              <Link className="font-bold text-accent hover:underline" href="/login">
                {t('auth.login')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
