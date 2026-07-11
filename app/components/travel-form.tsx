'use client';

import { useActionState } from 'react';
import { useTranslation } from 'react-i18next';
import { generateTravelAdviceAction, type PlanActionState } from '@/app/actions';
import { ActionStatusMessage } from '@/app/components/action-status-message';
import { DEFAULT_PROFILE, LANGUAGE_OPTIONS, TRANSPORT_MODE_OPTIONS } from '@/lib/form-options';
import { formLanguageValues, supportedLanguages, type SupportedLanguage } from '@/lib/i18n/resources';

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
  defaultLanguage,
}: TravelFormProps) {
  const { i18n, t } = useTranslation();
  const currentLanguage = supportedLanguages.includes(i18n.language as SupportedLanguage)
    ? (i18n.language as SupportedLanguage)
    : 'en';
  const initialState: PlanActionState = { status: 'idle', message: t('travel.formIdle') };
  const [state, formAction, pending] = useActionState(generateTravelAdviceAction, initialState);
  const selectedLanguage = defaultLanguage ?? formLanguageValues[currentLanguage];

  return (
    <form action={formAction} className="grid gap-4 rounded-3xl border border-[color:var(--outline-variant)] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
      <input type="hidden" name="locale" value={currentLanguage} />
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--sky)] font-semibold">{t('travel.formEyebrow')}</p>
        <h2 className="mt-2 text-2xl font-bold text-[color:var(--foreground)] tracking-tight">{t('travel.formTitle')}</h2>
      </div>
      
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono uppercase text-[color:var(--muted)] pl-1">{t('common.city')}</label>
        <input 
          name="city" 
          defaultValue={defaultCity} 
          className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--sky)] focus:outline-none transition-all duration-200" 
          placeholder={t('common.city')}
          required 
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono uppercase text-[color:var(--muted)] pl-1">{t('travel.route')}</label>
        <input 
          name="route" 
          defaultValue={defaultRoute} 
          className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--sky)] focus:outline-none transition-all duration-200" 
          placeholder={t('travel.routePlaceholder')}
          required 
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono uppercase text-[color:var(--muted)] pl-1">{t('travel.transportMode')}</label>
        <select 
          name="mode" 
          defaultValue={defaultMode} 
          className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--sky)] focus:outline-none transition-all duration-200"
        >
          {TRANSPORT_MODE_OPTIONS.map((mode) => (
            <option key={mode}>{mode}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono uppercase text-[color:var(--muted)] pl-1">{t('common.preferredLanguage')}</label>
        <select 
          name="language" 
          defaultValue={selectedLanguage}
          className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--sky)] focus:outline-none transition-all duration-200"
        >
          {LANGUAGE_OPTIONS.map((language) => (
            <option key={language}>{language}</option>
          ))}
        </select>
      </div>

      <ActionStatusMessage state={state} />
      
      <button 
        disabled={pending} 
        className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[color:var(--navy)] to-[#1e2a40] font-semibold text-white shadow-md shadow-slate-900/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-slate-900/25 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
      >
        {pending ? (
          <>
            <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{t('travel.generating')}</span>
          </>
        ) : (
          <>
            <span>{t('travel.submit')}</span>
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
