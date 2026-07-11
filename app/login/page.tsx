import type { Metadata } from 'next';
import { LoginClient } from './login-client';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to MausamOG with a one-time passwordless magic link to access your monsoon preparedness dashboard and saved safety tools.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/login',
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
