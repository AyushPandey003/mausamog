import type { Metadata } from 'next';
import { getPeerAlertData } from '@/app/actions';
import { getAlerts, getLatestPlan, getResources, geocode } from '@/lib/repository';
import { AlertsExperience } from '@/app/components/alerts-experience';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Alerts',
  description: 'Explore the MausamOG alert center with interactive Mapbox risk zones, monsoon warning overlays, and nearby emergency resources for your city.',
  alternates: {
    canonical: '/alerts',
  },
  openGraph: {
    title: 'MausamOG Alerts',
    description: 'Interactive monsoon alert maps, emergency resources, and risk overlays for flood-prone areas and severe rain conditions.',
    url: '/alerts',
  },
  twitter: {
    title: 'MausamOG Alerts',
    description: 'Interactive monsoon alert maps, emergency resources, and risk overlays for flood-prone areas and severe rain conditions.',
  },
};

export default async function AlertsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const plan = await getLatestPlan(user.id);
  const city = plan?.input.city ?? 'Bengaluru';
  const [{ peerReports }, alerts, resources] = await Promise.all([
    getPeerAlertData(city),
    getAlerts(city),
    getResources(city),
  ]);

  // Geocode city coordinates dynamically, falling back to Bengaluru center
  const cityCoords = await geocode(city).then((coords) => (coords ?? [77.5946, 12.9716]) as [number, number]);

  // Geocode alert zones dynamically, falling back to offset of city center
  const alertsWithCoords = await Promise.all(
    alerts.map(async (alert, index) => {
      const query = `${alert.meta.zone ?? alert.title}, ${city}`;
      const coords = await geocode(query);
      return {
        ...alert,
        coordinates: coords ?? ([cityCoords[0] + (index + 1) * 0.015, cityCoords[1] + ((index + 1) % 2 === 0 ? 0.01 : -0.01)] as [number, number]),
      };
    })
  );

  // Geocode resource locations dynamically, falling back to offset of city center
  const resourcesWithCoords = await Promise.all(
    resources.map(async (resource, index) => {
      const query = `${resource.name}, ${resource.address}, ${city}`;
      const coords = await geocode(query);
      return {
        ...resource,
        coordinates: coords ?? ([cityCoords[0] - 0.02 - (index + 1) * 0.015, cityCoords[1] - 0.01 + (index + 1) * 0.008] as [number, number]),
      };
    })
  );

  return (
    <AlertsExperience
      city={city}
      cityCoordinates={cityCoords}
      alerts={alertsWithCoords}
      resources={resourcesWithCoords}
      peerReports={peerReports}
    />
  );
}
