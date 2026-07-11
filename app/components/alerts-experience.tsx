'use client';

import { useActionState, useMemo, useState } from 'react';
import { reportPeerAlertAction, type PlanActionState } from '@/app/actions';
import { ActionStatusMessage } from '@/app/components/action-status-message';
import type { PeerAlertReport } from '@/lib/schema';
import { AlertsMap } from './alerts-map';

type AlertItem = {
  city: string;
  severity: string;
  title: string;
  summary: string;
  source: string;
  meta: Record<string, string>;
};

type ResourceItem = {
  city: string;
  name: string;
  kind: string;
  address: string;
  phone: string;
  openStatus: string;
  meta: Record<string, string | undefined>;
};

const initialReportState: PlanActionState = { status: 'idle', message: '' };

const peerAlertTypes = [
  { value: 'road_block', label: 'Road block' },
  { value: 'landslide', label: 'Landslide' },
  { value: 'waterlogging', label: 'Waterlogging' },
  { value: 'tree_fall', label: 'Tree fall' },
  { value: 'power_line', label: 'Power line' },
  { value: 'other', label: 'Other' },
] as const;

export function AlertsExperience({
  city,
  alerts,
  resources,
  peerReports,
}: {
  city: string;
  alerts: AlertItem[];
  resources: ResourceItem[];
  peerReports: PeerAlertReport[];
}) {
  const [selectedAlertIndex, setSelectedAlertIndex] = useState(0);
  const [selectedResourceIndex, setSelectedResourceIndex] = useState(0);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showPeerReports, setShowPeerReports] = useState(true);
  const [reportState, reportAction, reportPending] = useActionState(reportPeerAlertAction, initialReportState);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracyMeters?: number } | null>(null);
  const [locationMessage, setLocationMessage] = useState('');

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
      setLocationMessage('Location is not available in this browser.');
      return;
    }

    setLocationMessage('Requesting device location permission...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        });
        setLocationMessage(`Location ready, accuracy ${Math.round(position.coords.accuracy)}m.`);
      },
      () => setLocationMessage('Location permission was blocked or unavailable. Enable it to place the report on the map.'),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 10_000 },
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
      <section className="card min-h-[480px] overflow-hidden bg-[linear-gradient(135deg,#eaf4ff,#f7f9fb)] shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--sky)] font-semibold">Interactive risk map</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[color:var(--foreground)]">Risk zones and alert overlays</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
              Interactive Mapbox view centered on <strong>{city}</strong> showing active risk areas, local resources, and peer reports.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold uppercase tracking-[0.12em]">
            <div className="rounded-2xl border border-[color:var(--outline-variant)] bg-white px-3 py-2 text-[color:var(--muted)]">{stats.alertCount} alerts</div>
            <div className="rounded-2xl border border-[color:var(--outline-variant)] bg-white px-3 py-2 text-[color:var(--muted)]">{stats.peerCount} peer</div>
            <div className="rounded-2xl border border-[color:var(--outline-variant)] bg-white px-3 py-2 text-[color:var(--accent)]">{stats.highestSeverity} risk</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowAlerts((value) => !value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${showAlerts ? 'bg-[color:var(--accent)] text-white' : 'border border-[color:var(--outline-variant)] bg-white text-[color:var(--muted)]'}`}>Alerts</button>
          <button type="button" onClick={() => setShowResources((value) => !value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${showResources ? 'bg-[color:var(--foreground)] text-white' : 'border border-[color:var(--outline-variant)] bg-white text-[color:var(--muted)]'}`}>Resources</button>
          <button type="button" onClick={() => setShowRiskZones((value) => !value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${showRiskZones ? 'bg-[color:var(--sky)] text-white' : 'border border-[color:var(--outline-variant)] bg-white text-[color:var(--muted)]'}`}>Risk zones</button>
          <button type="button" onClick={() => setShowPeerReports((value) => !value)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${showPeerReports ? 'bg-emerald-600 text-white' : 'border border-[color:var(--outline-variant)] bg-white text-[color:var(--muted)]'}`}>Peer reports</button>
        </div>

        <div className="mt-6 h-full min-h-[420px] overflow-hidden rounded-2xl border border-[color:var(--outline-variant)]">
          <AlertsMap
            city={city}
            alerts={alerts}
            resources={resources}
            peerReports={peerReports}
            selectedAlertIndex={selectedAlertIndex}
            selectedResourceIndex={selectedResourceIndex}
            showAlerts={showAlerts}
            showResources={showResources}
            showRiskZones={showRiskZones}
            showPeerReports={showPeerReports}
          />
        </div>
      </section>

      <aside className="grid gap-6">
        <section className="card shadow-md">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-700 font-semibold">Peer field report</p>
          <h2 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">Report a local hazard</h2>
          <form action={reportAction} className="mt-5 grid gap-3">
            <input type="hidden" name="city" value={city} />
            <input type="hidden" name="latitude" value={location?.latitude ?? ''} />
            <input type="hidden" name="longitude" value={location?.longitude ?? ''} />
            <input type="hidden" name="accuracyMeters" value={location?.accuracyMeters ?? ''} />
            <select name="type" className="input" defaultValue="road_block">
              {peerAlertTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <select name="severity" className="input" defaultValue="moderate">
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
            <textarea name="description" className="input min-h-24" maxLength={220} placeholder="Example: road blocked by fallen tree near the flyover" required />
            <button type="button" onClick={requestReportLocation} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100">
              Use my location
            </button>
            {locationMessage ? <p className="text-xs leading-5 text-[color:var(--muted)]">{locationMessage}</p> : null}
            <ActionStatusMessage state={reportState} />
            <button disabled={reportPending || !location} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
              {reportPending ? 'Reporting...' : 'Send peer alert'}
            </button>
          </form>
        </section>

        <section className="card shadow-md">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-700 font-semibold">Crowd layer</p>
          <h2 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">Recent peer alerts</h2>
          <div className="mt-6 space-y-3">
            {peerReports.length === 0 ? (
              <p className="py-4 text-center text-sm text-[color:var(--muted)]">No peer reports for {city} yet.</p>
            ) : (
              peerReports.map((report) => (
                <div key={report.id} className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-800 font-bold">{report.type.replace('_', ' ')} | {report.severity}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--foreground)]">{report.description}</p>
                  <p className="mt-2 text-[10px] text-[color:var(--muted)]">{new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card shadow-md">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold">Active alert stack</p>
          <h2 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">Monsoon warnings</h2>
          <p className="mt-1 text-xs text-[color:var(--muted)]">Click an alert to focus the map.</p>
          <div className="mt-6 space-y-3">
            {alerts.length === 0 ? (
              <p className="py-4 text-center text-sm text-[color:var(--muted)]">No active alerts for {city} at this time.</p>
            ) : (
              alerts.map((alert, index) => (
                <button key={alert.title} type="button" onClick={() => setSelectedAlertIndex(index)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedAlertIndex === index ? 'border-[color:var(--accent)] bg-orange-50' : 'border-[color:var(--outline-variant)]/60 bg-[color:var(--surface-soft)]/45 hover:bg-[color:var(--surface-soft)]'}`}>
                  <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[color:var(--accent)] font-bold">{alert.severity}</p>
                  <h3 className="mt-1 text-base font-bold text-[color:var(--foreground)]">{alert.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{alert.summary}</p>
                  <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.1em] text-[color:var(--muted)]">{alert.meta.zone ?? city} | {alert.meta.window ?? 'Active'}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="card shadow-md">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--sky)] font-semibold">Nearby help</p>
          <h2 className="mt-2 text-xl font-bold text-[color:var(--foreground)]">Emergency resources</h2>
          <p className="mt-1 text-xs text-[color:var(--muted)]">Click a resource to jump to it on the map.</p>
          <div className="mt-6 space-y-3">
            {resources.map((resource, index) => (
              <button key={resource.name} type="button" onClick={() => setSelectedResourceIndex(index)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedResourceIndex === index ? 'border-[color:var(--foreground)] bg-slate-50' : 'border-[color:var(--outline-variant)]/60 bg-white hover:bg-[color:var(--surface-soft)]'}`}>
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[color:var(--sky)] font-bold">{resource.kind}</p>
                <h3 className="mt-1 text-base font-bold text-[color:var(--foreground)]">{resource.name}</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">{resource.address}</p>
                <p className="mt-2 text-sm font-medium text-[color:var(--foreground)]">{resource.phone} | {resource.openStatus}</p>
              </button>
            ))}
          </div>
        </section>

        {(selectedAlert || selectedResource) && (
          <section className="card shadow-md">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--accent)] font-semibold">Focused context</p>
            {selectedAlert ? (
              <div className="mt-3 rounded-2xl bg-[color:var(--surface-soft)] p-4">
                <h3 className="font-bold text-[color:var(--foreground)]">{selectedAlert.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{selectedAlert.summary}</p>
              </div>
            ) : null}
            {selectedResource ? (
              <div className="mt-3 rounded-2xl bg-white p-4 border border-[color:var(--outline-variant)]">
                <h3 className="font-bold text-[color:var(--foreground)]">{selectedResource.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{selectedResource.meta.support ?? 'Emergency support available.'}</p>
              </div>
            ) : null}
          </section>
        )}
      </aside>
    </div>
  );
}
