import type { Metadata } from 'next';
import './globals.css';
import { Header } from './components/header';
import { I18nProvider } from './components/i18n-provider';
import { getRequestLanguage } from '@/lib/i18n/server';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mausamog.vercel.app';
const siteName = 'MausamOG';
const defaultTitle = 'MausamOG | GenAI Monsoon Preparedness & Citizen Assistance';
const defaultDescription = 'MausamOG is a GenAI-powered monsoon preparedness platform with personalized safety plans, emergency checklists, travel advisories, alerts, multilingual guidance, and local resource discovery.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  keywords: [
    'monsoon preparedness',
    'citizen assistance',
    'emergency checklist',
    'travel advisory',
    'weather alerts',
    'GenAI safety planning',
    'MausamOG',
  ],
  authors: [{ name: 'Ayush Pandey' }],
  creator: 'Ayush Pandey',
  publisher: siteName,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
  },
  category: 'weather safety',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const language = await getRequestLanguage();

  return (
    <html lang={language} className="h-full antialiased">
      <body className="min-h-full bg-[color:var(--background)] text-[color:var(--foreground)]">
        <I18nProvider initialLanguage={language}>
          <Header />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
