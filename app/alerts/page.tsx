import { getPeerAlertData } from '@/app/actions';
import { getAlerts, getLatestPlan, getResources } from '@/lib/repository';
import { AlertsExperience } from '@/app/components/alerts-experience';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AlertsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const plan = await getLatestPlan(user.id);
  const city = plan?.input.city ?? 'Bengaluru';
  const [alerts, resources, peerAlertData] = await Promise.all([getAlerts(city), getResources(city), getPeerAlertData(city)]);

  return <AlertsExperience city={city} alerts={alerts} resources={resources} peerReports={peerAlertData.peerReports} />;
}
