import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { logoutAction } from '@/app/actions';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/checklist', label: 'Checklist' },
  { href: '/travel', label: 'Travel' },
  { href: '/assistant', label: 'Assistant' },
  { href: '/resources', label: 'Resources' },
];

export async function Header() {
  const user = await getSessionUser();
  if (!user) return null;

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--outline-variant)] bg-[rgba(247,249,251,0.88)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]">MausamOG</p>
          <h1 className="text-lg font-bold text-[color:var(--foreground)]">Monsoon Preparedness & Citizen Assistance</h1>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden flex-wrap gap-2 md:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full border border-[color:var(--outline-variant)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--muted)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]">
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-3 pl-4 border-l border-[color:var(--outline-variant)]">
            <div className="w-8 h-8 rounded-full bg-[color:var(--navy)] text-white text-xs font-bold flex items-center justify-center shadow-sm">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-[color:var(--foreground)]">{user.fullName}</span>
              <span className="text-[10px] text-[color:var(--muted)]">{user.email}</span>
            </div>
            <form action={logoutAction}>
              <button className="rounded-xl border border-[color:var(--outline-variant)] bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--muted)] hover:border-red-400 hover:text-red-500 transition">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
