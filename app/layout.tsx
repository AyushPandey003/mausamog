import type { Metadata } from 'next';
import './globals.css';
import { Header } from './components/header';

export const metadata: Metadata = {
  title: 'MausamOG',
  description: 'GenAI-powered monsoon preparedness and citizen assistance command center.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[color:var(--background)] text-[color:var(--foreground)]">
        <Header />
        {children}
      </body>
    </html>
  );
}
