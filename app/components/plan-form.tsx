'use client';

import { useActionState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePreparednessPlanAction, type PlanActionState } from '@/app/actions';
import { ActionStatusMessage } from '@/app/components/action-status-message';
import { DEFAULT_PROFILE, HOUSING_TYPE_OPTIONS, LANGUAGE_OPTIONS, NEED_OPTIONS } from '@/lib/form-options';
import { formLanguageValues, supportedLanguages, type SupportedLanguage } from '@/lib/i18n/resources';

export function PlanForm() {
  const { i18n, t } = useTranslation();
  const currentLanguage = supportedLanguages.includes(i18n.language as SupportedLanguage)
    ? (i18n.language as SupportedLanguage)
    : 'en';
  const initialState: PlanActionState = { status: 'idle', message: t('planForm.idle') };
  const [state, formAction, pending] = useActionState(generatePreparednessPlanAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-3xl border border-[color:var(--outline-variant)] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
      <input type="hidden" name="locale" value={currentLanguage} />
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold">{t('planForm.eyebrow')}</p>
        <h2 className="mt-2 text-2xl font-bold text-[color:var(--foreground)] tracking-tight">{t('planForm.title')}</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <input 
          name="city" 
          defaultValue={DEFAULT_PROFILE.city} 
          aria-label={t('common.city')}
          className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200" 
          placeholder={t('common.city')}
          required 
        />
        <input 
          name="pincode" 
          defaultValue={DEFAULT_PROFILE.pincode} 
          aria-label={t('common.pincode')}
          className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200" 
          placeholder={t('common.pincode')}
          required 
        />
        <input 
          name="landmark" 
          defaultValue={DEFAULT_PROFILE.landmark} 
          aria-label={t('common.landmark')}
          className="input sm:col-span-2 bg-slate-50/50 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200" 
          placeholder={t('common.landmark')}
          required 
        />
        <select 
          name="language" 
          defaultValue={formLanguageValues[currentLanguage]}
          aria-label={t('common.language')}
          className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200"
        >
          {LANGUAGE_OPTIONS.map((language) => (
            <option key={language}>{language}</option>
          ))}
        </select>
        <select 
          name="housingType" 
          defaultValue={DEFAULT_PROFILE.housingType} 
          aria-label={t('planForm.housingType')}
          className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200"
        >
          {HOUSING_TYPE_OPTIONS.map((housingType) => (
            <option key={housingType}>{housingType}</option>
          ))}
        </select>
        <input 
          name="travelMode" 
          defaultValue={DEFAULT_PROFILE.travelMode} 
          aria-label={t('planForm.travelMode')}
          className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200" 
          placeholder={t('planForm.travelMode')}
          required 
        />
        <input 
          name="travelRoute" 
          defaultValue={DEFAULT_PROFILE.travelRoute} 
          aria-label={t('planForm.travelRoute')}
          className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200" 
          placeholder={t('planForm.travelRoute')}
          required 
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono uppercase text-[color:var(--muted)] pl-1">{t('planForm.adults')}</label>
          <input name="adults" type="number" min={1} max={12} defaultValue={2} className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200" placeholder={t('planForm.adults')} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono uppercase text-[color:var(--muted)] pl-1">{t('planForm.children')}</label>
          <input name="children" type="number" min={0} max={12} defaultValue={1} className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200" placeholder={t('planForm.children')} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono uppercase text-[color:var(--muted)] pl-1">{t('planForm.elderly')}</label>
          <input name="elderly" type="number" min={0} max={12} defaultValue={1} className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200" placeholder={t('planForm.elderly')} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono uppercase text-[color:var(--muted)] pl-1">{t('planForm.pets')}</label>
          <input name="pets" type="number" min={0} max={12} defaultValue={0} className="input bg-slate-50/50 focus:bg-white focus:border-[color:var(--accent)] focus:outline-none transition-all duration-200" placeholder={t('planForm.pets')} />
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-[color:var(--muted)] cursor-pointer select-none pl-1 mt-1 hover:text-[color:var(--foreground)] transition-colors">
        <input name="floodProne" type="checkbox" className="h-4 w-4 accent-[color:var(--accent)]" /> 
        <span>{t('planForm.floodProne')}</span>
      </label>

      <fieldset className="border-t border-slate-100 pt-3">
        <legend className="text-xs font-semibold font-mono uppercase tracking-wider text-[color:var(--foreground)] mb-2">{t('planForm.additionalNeeds')}</legend>
        <div className="flex flex-wrap gap-2">
          {NEED_OPTIONS.map((option) => (
            <label 
              key={option} 
              className="flex items-center rounded-full border border-[color:var(--outline-variant)]/60 hover:border-[color:var(--accent)] hover:bg-orange-50/10 px-3 py-1.5 text-xs text-[color:var(--muted)] cursor-pointer select-none transition-all duration-200 bg-slate-50/40"
            >
              <input type="checkbox" name="needs" value={option} className="mr-2 accent-[color:var(--accent)]" />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <ActionStatusMessage state={state} />

      <button 
        disabled={pending} 
        className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[color:var(--accent)] to-[color:var(--accent-strong)] font-semibold text-white shadow-md shadow-orange-500/10 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
      >
        {pending ? (
          <>
            <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{t('planForm.generating')}</span>
          </>
        ) : (
          <>
            <span>{t('planForm.submit')}</span>
            <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
