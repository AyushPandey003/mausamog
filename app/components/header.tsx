import { getSessionUser } from '@/lib/auth';
import { HeaderClient } from './header-client';

export async function Header() {
  const user = await getSessionUser();
  if (!user) return null;

  return <HeaderClient user={user} />;
}
