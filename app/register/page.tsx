import type { Metadata } from 'next';
import { RegisterClient } from './register-client';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a MausamOG safety profile to receive monsoon alerts, personalized preparedness plans, emergency checklists, and travel guidance.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/register',
  },
};

export default function RegisterPage() {
  return <RegisterClient />;
}
