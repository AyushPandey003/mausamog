'use client';

import { useActionState, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { reportPeerAlertAction } from '@/app/actions';
import { ActionStatusMessage } from '@/app/components/action-status-message';
import { supportedLanguages, type SupportedLanguage } from '@/lib/i18n/resources';
import type { PeerAlertReport } from '@/lib/schema';
import { AlertsMap } from './alerts-map';

type AlertItem = {
  city: string;
  severity: string;
  title: string;
  summary: string;
  source: string;
  meta: Record<string, string>;
  coordinates?: [number, number];
};

type ResourceItem = {
  city: string;
  name: string;
  kind: string;
  address: string;
  phone: string;
  openStatus: string;
  meta: Record<string, string | undefined>;
  coordinates?: [number, number];
};

const peerAlertTypes = [
  { value: 'road_block', labelKey: 'alertsPage.peerAlertTypes.road_block' },
  { value: 'landslide', labelKey: 'alertsPage.peerAlertTypes.landslide' },
  { value: 'waterlogging', labelKey: 'alertsPage.peerAlertTypes.waterlogging' },
  { value: 'tree_fall', labelKey: 'alertsPage.peerAlertTypes.tree_fall' },
  { value: 'power_line', labelKey: 'alertsPage.peerAlertTypes.power_line' },
  { value: 'other', labelKey: 'alertsPage.peerAlertTypes.other' },
] as const;

export function AlertsExperience({
  city,
  cityCoordinates,
  alerts,
  resources,
  peerReports,
}: {
  city: string;
  cityCoordinates: [number, number];
  alerts: AlertItem[];
  resources: ResourceItem[];
  peerReports: PeerAlertReport[];
}) {
  const { i18n, t } = useTranslation();
  const currentLanguage = supportedLanguages.includes(i18n.language as SupportedLanguage)
    ? (i18n.language as SupportedLanguage)
    : 'en';
  const [selectedAlertIndex, setSelectedAlertIndex] = useState(0);
  const [selectedResourceIndex, setSelectedResourceIndex] = useState(0);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showPeerReports, setShowPeerReports] = useState(true);
  const [selectedPeerReportIndex, setSelectedPeerReportIndex] = useState(0);
  const [reportState, reportAction, reportPending] = useActionState(reportPeerAlertAction, { status: 'idle', message: '' });
  
  const [prevCity, setPrevCity] = useState(city);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracyMeters?: number } | null>(() => {
    return {
      latitude: cityCoordinates[1],
      longitude: cityCoordinates[0],
    };
  });
  const [locationMessage, setLocationMessage] = useState('');

  // Synchronize state with props during render to avoid useEffect set-state error
  if (city !== prevCity) {
    setPrevCity(city);
    setLocation({
      latitude: cityCoordinates[1],
      longitude: cityCoordinates[0],
    });
    setLocationMessage('');
  }

  const selectedAlert = alerts[selectedAlertIndex] ?? null;
  const selectedResource = resources[selectedResourceIndex] ?? null;

  const stats = useMemo(
    () => ({
      alertCount: alerts.length,
      peerCount: peerReports.length,
      resourceCount: resources.length,
      highestSeverity: alerts.some((item) => item.severity === 'high') || peerReports.some((item) => item.severity === 'high')
        ? 'high'
        : alerts.some((item) => item.severity === 'moderate') || peerReports.some((item) => item.severity === 'moderate')
          ? 'moderate'
          : 'low',
    }),
    [alerts, peerReports, resources],
  );

  function requestReportLocation() {
    if (!navigator.geolocation) {
      setLocationMessage(t('alertsPage.locationUnavailable'));
      return;
    }

    setLocationMessage(t('alertsPage.locationRequesting'));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        });
        setLocationMessage(t('alertsPage.locationReady', { meters: Math.round(position.coords.accuracy) }));
      },
      () => setLocationMessage(t('alertsPage.locationBlocked')),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 },
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.45fr_0.55fr] lg:px-8">
      <div className="flex flex-col gap-6">
        <section className="card min-h-[640px] overflow-hidden bg-surface-strong/45 shadow-md backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky font-semibold">{t('alertsPage.interactiveRiskMap')}</p>
              <h1 className="mt-2 text-3xl font-extrabold text-[color:var(--foreground)]">{t('alertsPage.riskZonesTitle')}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
                {t('alertsPage.mapIntro', { city })}
              </p>
              
              {/* Dynamic City Selector */}
              <div className="mt-4 flex items-center gap-2.5">
                <label className="text-[10px] font-mono uppercase tracking-[0.1em] text-[color:var(--muted)]">{t('common.city')}</label>
                <select
                  value={city}
                  onChange={(e) => {
                    window.location.href = `/alerts?city=${encodeURIComponent(e.target.value)}`;
                  }}
                  className="rounded-xl border border-outline-variant bg-surface-strong px-3 py-1.5 text-xs font-semibold text-[color:var(--foreground)] shadow-sm focus:outline-none focus:ring-1 focus:ring-sky cursor-pointer"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold uppercase tracking-[0.12em]">
              <div className="rounded-2xl border border-outline-variant bg-surface-strong px-3 py-2 text-[color:var(--muted)]">{stats.alertCount} {t('alertsPage.alerts')}</div>
              <div className="rounded-2xl border border-outline-variant bg-surface-strong px-3 py-2 text-[color:var(--muted)]">{stats.peerCount} {t('alertsPage.peer')}</div>
              <div className="rounded-2xl border border-outline-variant bg-surface-strong px-3 py-2 text-accent">{stats.highestSeverity} {t('common.risk')}</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowAlerts((value) => !value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer ${showAlerts ? 'bg-accent text-white' : 'border border-outline-variant bg-surface-strong text-[color:var(--muted)]'}`}>{t('nav.alerts')}</button>
            <button type="button" onClick={() => setShowResources((value) => !value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer ${showResources ? 'bg-[color:var(--foreground)] text-[color:var(--background)]' : 'border border-outline-variant bg-surface-strong text-[color:var(--muted)]'}`}>{t('nav.resources')}</button>
            <button type="button" onClick={() => setShowRiskZones((value) => !value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer ${showRiskZones ? 'bg-sky text-white' : 'border border-outline-variant bg-surface-strong text-[color:var(--muted)]'}`}>{t('alertsPage.riskZones')}</button>
            <button type="button" onClick={() => setShowPeerReports((value) => !value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer ${showPeerReports ? 'bg-emerald-600 text-white' : 'border border-outline-variant bg-surface-strong text-[color:var(--muted)]'}`}>{t('alertsPage.peerReports')}</button>
          </div>

          <div className="mt-6 h-full min-h-[580px] overflow-hidden rounded-2xl border border-[color:var(--outline-variant)]">
            <AlertsMap
              city={city}
              cityCoordinates={cityCoordinates}
              alerts={alerts}
              resources={resources}
              peerReports={peerReports}
              selectedAlertIndex={selectedAlertIndex}
              selectedResourceIndex={selectedResourceIndex}
              selectedPeerReportIndex={selectedPeerReportIndex}
              showAlerts={showAlerts}
              showResources={showResources}
              showRiskZones={showRiskZones}
              showPeerReports={showPeerReports}
              location={location}
              onLocationSelect={setLocation}
              setLocationMessage={setLocationMessage}
            />
          </div>
        </section>

        {/* Informational Stacks Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Active Alert Stack */}
          <section className="card shadow-md flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold">{t('alertsPage.activeAlertStack')}</p>
              <h2 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">{t('alertsPage.monsoonWarnings')}</h2>
              <p className="mt-1 text-xs text-[color:var(--muted)]">{t('alertsPage.clickAlert')}</p>
              <div className="mt-6 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <p className="py-4 text-center text-sm text-[color:var(--muted)]">{t('alertsPage.noActiveAlertsNow', { city })}</p>
                ) : (
                  alerts.map((alert, index) => (
                    <button key={alert.title} type="button" onClick={() => setSelectedAlertIndex(index)} className={`w-full rounded-2xl border p-4 text-left transition cursor-pointer ${selectedAlertIndex === index ? 'border-accent bg-accent/15' : 'border-outline-variant/60 bg-surface-soft/45 hover:bg-surface-soft'}`}>
                      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-accent font-bold">{alert.severity}</p>
                      <h3 className="mt-1 text-base font-bold text-[color:var(--foreground)]">{alert.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{alert.summary}</p>
                      <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.1em] text-[color:var(--muted)]">{alert.meta.zone ?? city} | {alert.meta.window ?? t('alertsPage.active')}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>
 
          {/* Nearby Help */}
          <section className="card shadow-md flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-sky font-semibold">{t('alertsPage.nearbyHelp')}</p>
              <h2 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">{t('alertsPage.emergencyResources')}</h2>
              <p className="mt-1 text-xs text-[color:var(--muted)]">{t('alertsPage.clickResource')}</p>
              <div className="mt-6 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {resources.length === 0 ? (
                  <p className="py-4 text-center text-sm text-[color:var(--muted)]">{t('resources.empty', { city })}</p>
                ) : (
                  resources.map((resource, index) => (
                    <button key={resource.name} type="button" onClick={() => setSelectedResourceIndex(index)} className={`w-full rounded-2xl border p-4 text-left transition cursor-pointer ${selectedResourceIndex === index ? 'border-foreground bg-surface-soft' : 'border-outline-variant/60 bg-surface-strong hover:bg-surface-soft'}`}>
                      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-sky font-bold">{resource.kind}</p>
                      <h3 className="mt-1 text-base font-bold text-[color:var(--foreground)]">{resource.name}</h3>
                      <p className="mt-2 text-sm text-[color:var(--muted)]">{resource.address}</p>
                      <p className="mt-2 text-sm font-medium text-[color:var(--foreground)]">{resource.phone} | {resource.openStatus}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
 
      <aside className="grid gap-6 auto-rows-max">
        {/* Peer Field Report Form */}
        <section className="card shadow-md">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400 font-semibold">{t('alertsPage.peerFieldReport')}</p>
          <h2 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">{t('alertsPage.reportLocalHazard')}</h2>
          <form action={reportAction} className="mt-5 grid gap-3">
            <input type="hidden" name="locale" value={currentLanguage} />
            <input type="hidden" name="city" value={city} />
            <input type="hidden" name="latitude" value={location?.latitude ?? ''} />
            <input type="hidden" name="longitude" value={location?.longitude ?? ''} />
            <input type="hidden" name="accuracyMeters" value={location?.accuracyMeters ?? ''} />
            <select name="type" className="input" defaultValue="road_block">
              {peerAlertTypes.map((type) => (
                <option key={type.value} value={type.value}>{t(type.labelKey)}</option>
              ))}
            </select>
            <select name="severity" className="input" defaultValue="moderate">
              <option value="low">{t('alertsPage.severity.low')}</option>
              <option value="moderate">{t('alertsPage.severity.moderate')}</option>
              <option value="high">{t('alertsPage.severity.high')}</option>
            </select>
            <textarea name="description" className="input min-h-24 font-sans text-sm" maxLength={220} placeholder={t('alertsPage.descriptionPlaceholder')} required />
            <button type="button" onClick={requestReportLocation} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-500 dark:text-emerald-400 transition hover:bg-emerald-500/20 cursor-pointer">
              {t('alertsPage.useMyLocation')}
            </button>
            {locationMessage ? (
              <p className="text-xs leading-5 text-[color:var(--muted)]">{locationMessage}</p>
            ) : (
              <p className="text-xs leading-5 text-[color:var(--muted)]">{t('alertsPage.mapTip')}</p>
            )}
            <ActionStatusMessage state={reportState} />
            <button disabled={reportPending || !location} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 cursor-pointer">
              {reportPending ? t('alertsPage.reporting') : t('alertsPage.sendPeerAlert')}
            </button>
          </form>
        </section>
 
        {/* Crowd Layer feed */}
        <section className="card shadow-md">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400 font-semibold">{t('alertsPage.crowdLayer')}</p>
          <h2 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">{t('alertsPage.recentPeerAlerts')}</h2>
          <div className="mt-6 space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {peerReports.length === 0 ? (
              <p className="py-4 text-center text-sm text-[color:var(--muted)]">{t('alertsPage.noPeerReports', { city })}</p>
            ) : (
              peerReports.map((report, index) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => setSelectedPeerReportIndex(index)}
                  className={`w-full rounded-2xl border p-4 text-left transition cursor-pointer ${selectedPeerReportIndex === index ? 'border-emerald-500 bg-emerald-500/15 shadow-sm' : 'border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10'}`}
                >
                  <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-500 dark:text-emerald-400 font-bold">{report.type.replace('_', ' ')} | {report.severity}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--foreground)]">{report.description}</p>
                  <p className="mt-2 text-[10px] text-[color:var(--muted)]">{new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </button>
              ))
            )}
          </div>
        </section>
 
        {/* Focused Context */}
        {(selectedAlert || selectedResource) && (
          <section className="card shadow-md animate-fade-in">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent font-semibold">{t('alertsPage.focusedContext')}</p>
            {selectedAlert ? (
              <div className="mt-3 rounded-2xl bg-[color:var(--surface-soft)] p-4">
                <h3 className="font-bold text-[color:var(--foreground)]">{selectedAlert.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{selectedAlert.summary}</p>
              </div>
            ) : null}
            {selectedResource ? (
              <div className="mt-3 rounded-2xl bg-surface-soft p-4 border border-outline-variant">
                <h3 className="font-bold text-[color:var(--foreground)]">{selectedResource.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{selectedResource.meta.support ?? t('alertsPage.emergencySupportAvailable')}</p>
              </div>
            ) : null}
          </section>
        )}
      </aside>
    </div>
  );
}
