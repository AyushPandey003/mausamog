'use client';

import { useEffect, useMemo, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import type { PeerAlertReport } from '@/lib/schema';

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

export const cityCenters: Record<string, [number, number]> = {
  bengaluru: [77.5946, 12.9716],
  mumbai: [72.8777, 19.076],
  chennai: [80.2707, 13.0827],
};

const alertCoordinates: Record<string, Record<string, [number, number]>> = {
  bengaluru: {
    'Waterlogging risk near low-lying junctions': [77.6205, 12.9352],
  },
  mumbai: {
    'Coastal flood watch and rail delays': [72.8441, 19.0596],
  },
  chennai: {
    'Localized thunderstorm advisory': [80.2702, 13.0569],
  },
};

const resourceCoordinates: Record<string, Record<string, [number, number]>> = {
  bengaluru: {
    'BBMP Community Relief Center': [77.6139, 12.9356],
    "St. John's Emergency Support Desk": [77.6227, 12.9346],
  },
  mumbai: {
    'Municipal Flood Relief Helpdesk': [72.8772, 19.0748],
  },
};

const severityColor: Record<string, string> = {
  high: '#dc2626',
  moderate: '#f97316',
  low: '#0284c7',
};

const peerTypeLabel: Record<PeerAlertReport['type'], string> = {
  landslide: 'Landslide',
  road_block: 'Road block',
  waterlogging: 'Waterlogging',
  tree_fall: 'Tree fall',
  power_line: 'Power line',
  other: 'Other hazard',
};

function keyForCity(city: string) {
  return city.trim().toLowerCase();
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function popupHtml(title: string, body: string, meta: string) {
  return `<div style="font-family: Arial, sans-serif; min-width: 220px; color: #0f172a;"><strong>${escapeHtml(title)}</strong><p style="margin-top:8px; font-size:13px; line-height:1.5; color: #334155;">${escapeHtml(body)}</p><p style="margin-top:8px; font-size:11px; text-transform:uppercase; color: #64748b;">${escapeHtml(meta)}</p></div>`;
}

export function AlertsMap({
  city,
  alerts,
  resources,
  peerReports,
  selectedAlertIndex,
  selectedResourceIndex,
  selectedPeerReportIndex,
  showAlerts,
  showResources,
  showRiskZones,
  showPeerReports,
  location,
  onLocationSelect,
  setLocationMessage,
  cityCoordinates,
}: {
  city: string;
  alerts: AlertItem[];
  resources: ResourceItem[];
  peerReports: PeerAlertReport[];
  selectedAlertIndex: number;
  selectedResourceIndex: number;
  selectedPeerReportIndex: number;
  showAlerts: boolean;
  showResources: boolean;
  showRiskZones: boolean;
  showPeerReports: boolean;
  location: { latitude: number; longitude: number; accuracyMeters?: number } | null;
  onLocationSelect?: (loc: { latitude: number; longitude: number; accuracyMeters?: number } | null) => void;
  setLocationMessage?: (msg: string) => void;
  cityCoordinates?: [number, number];
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<mapboxgl.Map | null>(null);
  const alertMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const resourceMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const peerMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const reportMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const center = useMemo(() => cityCoordinates ?? cityCenters[keyForCity(city)] ?? cityCenters.bengaluru, [city, cityCoordinates]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const container = mapRef.current;
    if (!token || !container || instanceRef.current) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom: 10.8,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    instanceRef.current = map;

    // Force recalculation of container size after mounting
    setTimeout(() => {
      map.resize();
    }, 150);

    // Handle map clicking to select report location
    map.on('click', (e) => {
      // Exclude clicks on markers/popups by checking if the original click target is the canvas
      if (e.originalEvent.target && (e.originalEvent.target as HTMLElement).tagName === 'CANVAS') {
        const { lng, lat } = e.lngLat;
        onLocationSelect?.({
          latitude: lat,
          longitude: lng,
        });
        setLocationMessage?.(`Selected location on map: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    });

    map.on('load', () => {
      map.resize();
      map.addSource('risk-zone', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [center[0] - 0.08, center[1] - 0.03],
                  [center[0] - 0.02, center[1] - 0.05],
                  [center[0] + 0.06, center[1] - 0.01],
                  [center[0] + 0.03, center[1] + 0.05],
                  [center[0] - 0.06, center[1] + 0.04],
                  [center[0] - 0.08, center[1] - 0.03],
                ]],
              },
              properties: {},
            },
          ],
        },
      });

      map.addLayer({
        id: 'risk-zone-fill',
        type: 'fill',
        source: 'risk-zone',
        paint: {
          'fill-color': '#f97316',
          'fill-opacity': 0.18,
        },
      });

      map.addLayer({
        id: 'risk-zone-line',
        type: 'line',
        source: 'risk-zone',
        paint: {
          'line-color': '#ea580c',
          'line-width': 2,
          'line-opacity': 0.75,
        },
      });

    });

    return () => {
      alertMarkersRef.current.forEach((marker) => marker.remove());
      resourceMarkersRef.current.forEach((marker) => marker.remove());
      peerMarkersRef.current.forEach((marker) => marker.remove());
      if (reportMarkerRef.current) {
        reportMarkerRef.current.remove();
        reportMarkerRef.current = null;
      }
      map.remove();
      instanceRef.current = null;
      alertMarkersRef.current = [];
      resourceMarkersRef.current = [];
      peerMarkersRef.current = [];
    };
  }, [center, onLocationSelect, setLocationMessage]);

  useEffect(() => {
    const map = instanceRef.current;
    if (!map) return;

    alertMarkersRef.current.forEach((marker) => marker.remove());
    alertMarkersRef.current = [];

    if (!showAlerts) return;

    alerts.forEach((alert, index) => {
      const coordinates = alert.coordinates ?? alertCoordinates[keyForCity(city)]?.[alert.title] ?? [center[0] + index * 0.02, center[1] + (index % 2 === 0 ? 0.015 : -0.015)];
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.style.width = index === selectedAlertIndex ? '20px' : '16px';
      marker.style.height = index === selectedAlertIndex ? '20px' : '16px';
      marker.style.borderRadius = '9999px';
      marker.style.border = '0';
      marker.style.cursor = 'pointer';
      marker.style.background = severityColor[alert.severity] ?? '#0284c7';
      marker.style.boxShadow = index === selectedAlertIndex ? '0 0 0 5px rgba(249,115,22,0.22)' : '0 0 0 4px rgba(255,255,255,0.92)';
      marker.setAttribute('aria-label', alert.title);

      const popup = new mapboxgl.Popup({ offset: 16 }).setHTML(
        popupHtml(alert.title, alert.summary, `${alert.severity} risk | ${alert.meta.zone ?? city}`),
      );

      const markerInstance = new mapboxgl.Marker(marker).setLngLat(coordinates as [number, number]).setPopup(popup).addTo(map);
      alertMarkersRef.current.push(markerInstance);
    });
  }, [alerts, center, city, selectedAlertIndex, showAlerts]);

  useEffect(() => {
    const map = instanceRef.current;
    if (!map) return;

    resourceMarkersRef.current.forEach((marker) => marker.remove());
    resourceMarkersRef.current = [];

    if (!showResources) return;

    resources.forEach((resource, index) => {
      const coordinates = resource.coordinates ?? resourceCoordinates[keyForCity(city)]?.[resource.name] ?? [center[0] - 0.04 + index * 0.018, center[1] - 0.02 + index * 0.01];
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.style.width = '18px';
      marker.style.height = '18px';
      marker.style.borderRadius = '6px';
      marker.style.border = '2px solid white';
      marker.style.cursor = 'pointer';
      marker.style.background = index === selectedResourceIndex ? '#131b2e' : '#0284c7';
      marker.style.boxShadow = '0 4px 14px rgba(2,132,199,0.28)';
      marker.setAttribute('aria-label', resource.name);

      const popup = new mapboxgl.Popup({ offset: 14 }).setHTML(
        popupHtml(resource.name, resource.address, `${resource.kind} | ${resource.openStatus}`),
      );

      const markerInstance = new mapboxgl.Marker(marker).setLngLat(coordinates).setPopup(popup).addTo(map);
      resourceMarkersRef.current.push(markerInstance);
    });
  }, [center, city, resources, selectedResourceIndex, showResources]);

  useEffect(() => {
    const map = instanceRef.current;
    if (!map) return;

    peerMarkersRef.current.forEach((marker) => marker.remove());
    peerMarkersRef.current = [];

    if (!showPeerReports) return;

    peerReports.forEach((report, index) => {
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = `peer-alert-marker peer-alert-marker-${report.severity}`;
      marker.setAttribute('aria-label', `${peerTypeLabel[report.type]} report`);
      marker.style.transform = index === selectedPeerReportIndex ? 'scale(1.18)' : 'scale(1)';
      marker.style.boxShadow = index === selectedPeerReportIndex ? '0 0 0 5px rgba(16,185,129,0.22)' : '';

      const popup = new mapboxgl.Popup({ offset: 18 }).setHTML(
        popupHtml(peerTypeLabel[report.type], report.description, `${report.severity} peer report | ${new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`),
      );

      const markerInstance = new mapboxgl.Marker(marker)
        .setLngLat([report.longitude, report.latitude])
        .setPopup(popup)
        .addTo(map);
      peerMarkersRef.current.push(markerInstance);
    });
  }, [peerReports, selectedPeerReportIndex, showPeerReports]);

  // Effect to manage rendering/updating the draggable report marker pin
  useEffect(() => {
    const map = instanceRef.current;
    if (!map) return;

    if (!location) {
      if (reportMarkerRef.current) {
        reportMarkerRef.current.remove();
        reportMarkerRef.current = null;
      }
      return;
    }

    const coords: [number, number] = [location.longitude, location.latitude];

    if (reportMarkerRef.current) {
      reportMarkerRef.current.setLngLat(coords);
    } else {
      const el = document.createElement('div');
      el.className = 'report-pin-marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#ef4444'; // Tailwind red-500
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      el.style.cursor = 'move';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      const dot = document.createElement('div');
      dot.style.width = '6px';
      dot.style.height = '6px';
      dot.style.borderRadius = '50%';
      dot.style.backgroundColor = 'white';
      el.appendChild(dot);

      const marker = new mapboxgl.Marker({
        element: el,
        draggable: true,
      })
        .setLngLat(coords)
        .addTo(map);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        onLocationSelect?.({
          latitude: lngLat.lat,
          longitude: lngLat.lng,
          accuracyMeters: location.accuracyMeters,
        });
        setLocationMessage?.(`Selected location on map: ${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`);
      });

      reportMarkerRef.current = marker;
    }
  }, [location, onLocationSelect, setLocationMessage]);

  useEffect(() => {
    const map = instanceRef.current;
    if (!map) return;
    if (!map.getLayer('risk-zone-fill') || !map.getLayer('risk-zone-line')) return;
    map.setLayoutProperty('risk-zone-fill', 'visibility', showRiskZones ? 'visible' : 'none');
    map.setLayoutProperty('risk-zone-line', 'visibility', showRiskZones ? 'visible' : 'none');
  }, [showRiskZones]);

  useEffect(() => {
    const map = instanceRef.current;
    const selectedAlert = alerts[selectedAlertIndex];
    if (!map || !selectedAlert || !showAlerts) return;
    const coordinates = selectedAlert.coordinates ?? alertCoordinates[keyForCity(city)]?.[selectedAlert.title];
    if (!coordinates) return;
    map.flyTo({ center: coordinates, zoom: 12, duration: 900, essential: true });
  }, [alerts, city, selectedAlertIndex, showAlerts]);

  useEffect(() => {
    const map = instanceRef.current;
    const selectedResource = resources[selectedResourceIndex];
    if (!map || !selectedResource || !showResources) return;
    const coordinates = selectedResource.coordinates ?? resourceCoordinates[keyForCity(city)]?.[selectedResource.name];
    if (!coordinates) return;
    map.flyTo({ center: coordinates, zoom: 12.2, duration: 900, essential: true });
  }, [city, resources, selectedResourceIndex, showResources]);

  useEffect(() => {
    const map = instanceRef.current;
    const selectedPeerReport = peerReports[selectedPeerReportIndex] ?? peerReports[0];
    if (!map || !selectedPeerReport || !showPeerReports) return;
    map.flyTo({ center: [selectedPeerReport.longitude, selectedPeerReport.latitude], zoom: 13, duration: 900, essential: true });
  }, [peerReports, selectedPeerReportIndex, showPeerReports]);

  const hasToken = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

  return (
    <div className="relative h-[580px] overflow-hidden rounded-3xl border border-[color:var(--outline-variant)] bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),radial-gradient(circle_at_bottom_right,#fed7aa,transparent_25%),white]">
      {hasToken ? (
        <div ref={mapRef} className="h-full w-full" aria-label="Monsoon risk map" />
      ) : (
        <div className="relative w-full h-full">
          {/* Map placeholder background image from Stitch */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-luminosity" 
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAS5wFaCFFaul66q9aOsCdSlnYdRZkK2pWcOVHImb8be15v0QiGFQrp0nhsCNH8tgMB71Aq1_fBF513wcrAIfz0PM2lYJ8layo2d5Bn8fMMlHAcTvjS7a7t544CyJhwC9WDYvb-257r3imTLn2QVdAfHN-AmqjMs4NC4AO4O6QAMWDYJZvWNCOdHaKt0tYpTWX-JgEGS5cKv1YLeFj8YBA5P3XjAEvs3MlFCff0-1kJgZACRxFJyJvxsABO2J6krzui6tVzsdbdK_8')` }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--background)] via-transparent to-transparent opacity-80" />
          
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-10">
            <div className="rounded-2xl border border-white/20 bg-white/70 p-6 shadow-lg backdrop-blur-md max-w-md">
              <p className="text-lg font-bold text-[color:var(--foreground)]">Map token not configured</p>
              <p className="mt-2 text-xs leading-relaxed text-[color:var(--muted)]">Add NEXT_PUBLIC_MAPBOX_TOKEN to enable alert overlays, shelters, route risk markers, and peer reports.</p>
            </div>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl bg-white/92 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--foreground)] shadow-sm z-10">
        {city} live risk view
      </div>
    </div>
  );
}
