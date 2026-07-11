'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateAssistantAnswer, generatePreparednessPlan, generateTravelAdvice } from '@/lib/ai';
import { sendMagicLinkEmail } from '@/lib/email';
import { buildWeatherContext } from '@/lib/monsoon';
import { getRedis } from '@/lib/redis';
import { createMagicLink, deleteSessionByTokenHash, findOrCreateUser, getUserByEmail, getAlerts, getAssistantMessages, getChecklist, getLatestPlan, getLatestTravelAdvisory, getResources, saveAssistantMessage, savePreparednessPlan, saveTravelAdvisory, toggleChecklistItem } from '@/lib/repository';
import { assistantSchema, preparednessSchema, travelSchema, loginSchema, signupSchema } from '@/lib/validation';
import { buildMagicLink, createOpaqueToken, hashToken, getSessionUser, SESSION_COOKIE_NAME } from '@/lib/auth';

export type PlanActionState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  magicLink?: string;
};

export async function loginAction(_: PlanActionState, formData: FormData): Promise<PlanActionState> {
  try {
    const input = loginSchema.parse({
      email: formData.get('email'),
    });

    const user = await getUserByEmail(input.email);
    if (!user) {
      return { status: 'success', message: 'If that email has a MausamOG account, a magic link has been prepared.' };
    }

    const token = createOpaqueToken();
    await createMagicLink(user.id, hashToken(token), 'login');
    const magicLink = buildMagicLink(await getRequestOrigin(), token);
    const email = await sendMagicLinkEmail({
      to: user.email,
      fullName: user.fullName,
      magicLink,
      intent: 'login',
    });

    if (email.sent) {
      return { status: 'success', message: 'Magic link sent. Check your email to sign in.' };
    }

    return {
      status: email.reason === 'send_failed' ? 'error' : 'success',
      message: email.reason === 'send_failed' ? 'Could not send the magic link email. Use the demo link below.' : 'Email is not fully configured yet. Use the demo magic link below.',
      magicLink,
    };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Login failed.' };
  }
}

export async function signupAction(_: PlanActionState, formData: FormData): Promise<PlanActionState> {
  try {
    const input = signupSchema.parse({
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      city: formData.get('city'),
    });

    const user = await findOrCreateUser(input.fullName, input.email);
    const token = createOpaqueToken();
    await createMagicLink(user.id, hashToken(token), 'signup');
    const magicLink = buildMagicLink(await getRequestOrigin(), token);
    const email = await sendMagicLinkEmail({
      to: user.email,
      fullName: user.fullName,
      magicLink,
      intent: 'signup',
    });

    if (email.sent) {
      return { status: 'success', message: 'Magic link sent. Check your email to finish signup.' };
    }

    return {
      status: email.reason === 'send_failed' ? 'error' : 'success',
      message: email.reason === 'send_failed' ? 'Could not send the signup email. Use the demo link below.' : 'Email is not fully configured yet. Use the demo magic link below.',
      magicLink,
    };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Registration failed.' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionToken) await deleteSessionByTokenHash(hashToken(sessionToken));
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete('session');
  redirect('/login');
}

async function getRequestOrigin() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  const headerStore = await headers();
  const origin = headerStore.get('origin');
  if (origin) return origin;
  const host = headerStore.get('host') ?? 'localhost:3000';
  const protocol = headerStore.get('x-forwarded-proto') ?? 'http';
  return `${protocol}://${host}`;
}

export async function generatePreparednessPlanAction(_: PlanActionState, formData: FormData): Promise<PlanActionState> {
  try {
    const user = await getSessionUser();
    if (!user) return { status: 'error', message: 'You must be logged in.' };

    const input = preparednessSchema.parse({
      city: formData.get('city'),
      pincode: formData.get('pincode'),
      landmark: formData.get('landmark'),
      language: formData.get('language'),
      travelMode: formData.get('travelMode'),
      travelRoute: formData.get('travelRoute'),
      household: {
        adults: formData.get('adults'),
        children: formData.get('children'),
        elderly: formData.get('elderly'),
        pets: formData.get('pets'),
        housingType: formData.get('housingType'),
        floodProne: formData.get('floodProne') === 'on',
        needs: formData.getAll('needs').map((value) => String(value)),
      },
    });

    const weather = buildWeatherContext(input.city);
    const generated = await generatePreparednessPlan(input, weather);
    await savePreparednessPlan(user.id, input, weather, generated.plan, generated.source);
    revalidatePath('/');
    revalidatePath('/alerts');
    revalidatePath('/travel');
    return { status: 'success', message: `Preparedness plan generated using ${generated.source}.` };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Could not generate the preparedness plan.' };
  }
}

export async function toggleChecklistAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) return;
  const city = String(formData.get('city') ?? 'Bengaluru');
  const itemKey = String(formData.get('itemKey') ?? '');
  if (!itemKey) return;
  await toggleChecklistItem(city, itemKey, user.id);
  revalidatePath('/');
  revalidatePath('/checklist');
}

export async function generateTravelAdviceAction(_: PlanActionState, formData: FormData): Promise<PlanActionState> {
  try {
    const user = await getSessionUser();
    if (!user) return { status: 'error', message: 'You must be logged in.' };

    const data = travelSchema.parse({
      city: formData.get('city'),
      route: formData.get('route'),
      mode: formData.get('mode'),
      language: formData.get('language'),
    });
    const generated = await generateTravelAdvice(data.city, data.route, data.mode, data.language);
    await saveTravelAdvisory(data.city, data.route, data.mode, generated.result, generated.source);
    revalidatePath('/travel');
    return { status: 'success', message: `Travel advisory refreshed using ${generated.source}.` };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Could not generate travel advice.' };
  }
}

export async function assistantAction(_: PlanActionState, formData: FormData): Promise<PlanActionState> {
  try {
    const user = await getSessionUser();
    if (!user) return { status: 'error', message: 'You must be logged in.' };

    const data = assistantSchema.parse({
      sessionId: formData.get('sessionId'),
      language: formData.get('language'),
      prompt: formData.get('prompt'),
      city: formData.get('city'),
    });

    const redis = getRedis();
    if (redis) {
      const key = `ratelimit:assistant:${user.id}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, 60);
      if (count > 6) {
        return { status: 'error', message: 'Slow down a bit. Please wait before sending more assistant requests.' };
      }
    }

    const answer = await generateAssistantAnswer(data.city, data.language, data.prompt);
    await saveAssistantMessage(user.id, data.sessionId, data.prompt, answer.answer, data.language, answer.source);
    revalidatePath('/assistant');
    return { status: 'success', message: `Assistant answered using ${answer.source}.` };
  } catch (error) {
    return { status: 'error', message: error instanceof Error ? error.message : 'Assistant request failed.' };
  }
}

export async function getHomeData() {
  const user = await getSessionUser();
  if (!user) {
    return { city: 'Bengaluru', plan: null, alerts: [], checklist: [], resources: [], user: null };
  }
  const plan = await getLatestPlan(user.id);
  const city = plan?.input.city ?? 'Bengaluru';
  const [alerts, checklist, resources] = await Promise.all([
    getAlerts(city),
    getChecklist(city, user.id),
    getResources(city),
  ]);
  return { city, plan, alerts, checklist, resources, user };
}

export async function getTravelData() {
  return { advisory: await getLatestTravelAdvisory() };
}

export async function getAssistantData() {
  const user = await getSessionUser();
  if (!user) return { sessionId: 'demo-session', messages: [] };
  const sessionId = `session-${user.id}`;
  return { sessionId, messages: await getAssistantMessages(user.id, sessionId) };
}
