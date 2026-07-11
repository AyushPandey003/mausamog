import type { Metadata } from 'next';
import { getPeerAlertData } from '@/app/actions';
import { getAlerts, getLatestPlan, getResources } from '@/lib/repository';
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
  const [{ peerReports }, alerts, resources] = await Promise.all([getPeerAlertData(city), getAlerts(city), getResources(city)]);

  return <AlertsExperience city={city} alerts={alerts} resources={resources} peerReports={peerReports} />;
}
