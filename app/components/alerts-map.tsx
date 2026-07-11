'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

type AlertItem = {
  city: string;
  severity: string;
  title: string;
  summary: string;
  source: string;
  meta: Record<string, string>;
};

const cityCenters: Record<string, [number, number]> = {
  bengaluru: [77.5946, 12.9716],
  mumbai: [72.8777, 19.076],
  chennai: [80.2707, 13.0827],
};

const severityColor: Record<string, string> = {
  high: '#dc2626',
  moderate: '#f97316',
  low: '#0284c7',
};

export function AlertsMap({ city, alerts }: { city: string; alerts: AlertItem[] }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const container = mapRef.current;
    if (!token || !container || instanceRef.current) return;

    mapboxgl.accessToken = token;
    const center = cityCenters[city.toLowerCase()] ?? cityCenters.bengaluru;

    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom: 10.5,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    alerts.forEach((alert, index) => {
      const offsetLng = center[0] + index * 0.03;
      const offsetLat = center[1] + ((index % 2 === 0 ? 1 : -1) * 0.02);
      const marker = document.createElement('div');
      marker.style.width = '16px';
      marker.style.height = '16px';
      marker.style.borderRadius = '9999px';
      marker.style.background = severityColor[alert.severity] ?? '#0284c7';
      marker.style.boxShadow = '0 0 0 4px rgba(255,255,255,0.9)';

      new mapboxgl.Marker(marker)
        .setLngLat([offsetLng, offsetLat])
        .setPopup(
          new mapboxgl.Popup({ offset: 16 }).setHTML(
            `<div style="font-family: Arial, sans-serif; min-width: 220px"><strong>${alert.title}</strong><p style="margin-top:8px; font-size:13px; line-height:1.5">${alert.summary}</p><p style="margin-top:8px; font-size:11px; text-transform:uppercase; color:#6b7280">${alert.severity} risk</p></div>`,
          ),
        )
        .addTo(map);
    });

    instanceRef.current = map;

    return () => {
      instanceRef.current?.remove();
      instanceRef.current = null;
    };
  }, [alerts, city]);

  const hasToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  return (
    <div className="relative h-[360px] overflow-hidden rounded-3xl border border-[color:var(--outline-variant)] bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_bottom_right,#fed7aa,transparent_25%),white]">
      {hasToken ? (
        <div ref={mapRef} className="h-full w-full" aria-label="Monsoon risk map" />
      ) : (
        <div className="grid h-full place-items-center text-center">
          <div>
            <p className="text-lg font-semibold">Map token not configured</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">Add NEXT_PUBLIC_MAPBOX_TOKEN to enable alert overlays, shelters, and route risk markers.</p>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-white/92 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--foreground)] shadow-sm">
        {city} live risk view
      </div>
    </div>
  );
}
