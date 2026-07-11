import { and, desc, eq, gt, isNull, lt, sql } from "drizzle-orm";
import alertsSeed from "../data/seed/alerts.json";
import checklistSeed from "../data/seed/checklist.json";
import resourcesSeed from "../data/seed/resources.json";
import { getDb } from "./db";
import { getRedis } from "./redis";
import { appUsers, assistantMessages, authMagicLinks, authSessions, checklistProgress, citizenProfiles, localResources, preparednessPlans, travelAdvisories, weatherAlerts, type PreparednessInput, type PreparednessPlan, type TravelAdvisory, type WeatherContext } from "./schema";

let schemaReady: Promise<void> | null = null;

export async function ensureSchema() {
  if (schemaReady) return schemaReady;
  schemaReady = (async () => {
    const db = getDb();
    if (!db) return;

    await db.execute(sql`create extension if not exists pgcrypto`);
    await db.execute(sql`create table if not exists app_users (id uuid primary key default gen_random_uuid(), full_name varchar(120) not null, email varchar(120) not null unique, password_hash text, created_at timestamptz not null default now())`);
    await db.execute(sql`alter table app_users alter column password_hash drop not null`);
    await db.execute(sql`create table if not exists auth_magic_links (id uuid primary key default gen_random_uuid(), user_id uuid not null references app_users(id), token_hash text not null unique, intent varchar(24) not null, expires_at timestamptz not null, consumed_at timestamptz, created_at timestamptz not null default now())`);
    await db.execute(sql`create table if not exists auth_sessions (id uuid primary key default gen_random_uuid(), user_id uuid not null references app_users(id), token_hash text not null unique, expires_at timestamptz not null, created_at timestamptz not null default now())`);
    await db.execute(sql`create table if not exists citizen_profiles (id uuid primary key default gen_random_uuid(), city varchar(80) not null, pincode varchar(12) not null, landmark text not null, language varchar(24) not null, household jsonb not null, created_at timestamptz not null default now())`);
    await db.execute(sql`create table if not exists preparedness_plans (id uuid primary key default gen_random_uuid(), profile_id uuid, source varchar(24) not null default 'gemini', risk_level varchar(24) not null, input jsonb not null, weather_context jsonb not null, plan jsonb not null, created_at timestamptz not null default now())`);
    await db.execute(sql`create table if not exists checklist_progress (id uuid primary key default gen_random_uuid(), city varchar(80) not null, category varchar(40) not null, item_key varchar(80) not null, label text not null, done boolean not null default false, priority varchar(24) not null default 'medium', created_at timestamptz not null default now())`);
    await db.execute(sql`create table if not exists weather_alerts (id uuid primary key default gen_random_uuid(), city varchar(80) not null, severity varchar(24) not null, title text not null, summary text not null, source varchar(24) not null default 'seeded', cached_until timestamptz, meta jsonb not null default '{}'::jsonb, created_at timestamptz not null default now())`);
    await db.execute(sql`create table if not exists travel_advisories (id uuid primary key default gen_random_uuid(), city varchar(80) not null, route text not null, mode varchar(24) not null, source varchar(24) not null default 'gemini', result jsonb not null, created_at timestamptz not null default now())`);
    await db.execute(sql`create table if not exists assistant_messages (id uuid primary key default gen_random_uuid(), session_id varchar(120) not null, prompt text not null, response text not null, language varchar(24) not null, source varchar(24) not null default 'gemini', created_at timestamptz not null default now())`);
    await db.execute(sql`create table if not exists local_resources (id uuid primary key default gen_random_uuid(), city varchar(80) not null, name text not null, kind varchar(32) not null, address text not null, phone varchar(32) not null, open_status varchar(32) not null, meta jsonb not null default '{}'::jsonb)`);

    await db.execute(sql`alter table citizen_profiles add column if not exists user_id uuid references app_users(id)`);
    await db.execute(sql`alter table preparedness_plans add column if not exists user_id uuid references app_users(id)`);
    await db.execute(sql`alter table checklist_progress add column if not exists user_id uuid references app_users(id)`);
    await db.execute(sql`alter table assistant_messages add column if not exists user_id uuid references app_users(id)`);
  })();
  return schemaReady;
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  if (!db) return null;
  await ensureSchema();
  const [user] = await db.select().from(appUsers).where(eq(appUsers.email, email.toLowerCase())).limit(1);
  return user ?? null;
}

export async function createUser(fullName: string, email: string) {
  const db = getDb();
  if (!db) throw new Error("Database not connected");
  await ensureSchema();
  const [user] = await db.insert(appUsers).values({
    fullName,
    email: email.toLowerCase(),
  }).returning();
  return user;
}

export async function findOrCreateUser(fullName: string, email: string) {
  const existing = await getUserByEmail(email);
  if (existing) return existing;
  return createUser(fullName, email);
}

export async function getUserById(id: string) {
  const db = getDb();
  if (!db) return null;
  await ensureSchema();
  const [user] = await db.select().from(appUsers).where(eq(appUsers.id, id)).limit(1);
  return user ?? null;
}

export async function createMagicLink(userId: string, tokenHash: string, intent: "login" | "signup") {
  const db = getDb();
  if (!db) throw new Error("Database not connected");
  await ensureSchema();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);
  await db.insert(authMagicLinks).values({ userId, tokenHash, intent, expiresAt });
  return expiresAt;
}

export async function consumeMagicLink(tokenHash: string) {
  const db = getDb();
  if (!db) return null;
  await ensureSchema();
  const [link] = await db
    .select()
    .from(authMagicLinks)
    .where(and(eq(authMagicLinks.tokenHash, tokenHash), isNull(authMagicLinks.consumedAt), gt(authMagicLinks.expiresAt, new Date())))
    .limit(1);
  if (!link) return null;

  await db.update(authMagicLinks).set({ consumedAt: new Date() }).where(eq(authMagicLinks.id, link.id));
  return link;
}

export async function createAuthSession(userId: string, tokenHash: string) {
  const db = getDb();
  if (!db) throw new Error("Database not connected");
  await ensureSchema();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await db.insert(authSessions).values({ userId, tokenHash, expiresAt });
  return expiresAt;
}

export async function getSessionByTokenHash(tokenHash: string) {
  const db = getDb();
  if (!db) return null;
  await ensureSchema();
  const [session] = await db.select().from(authSessions).where(eq(authSessions.tokenHash, tokenHash)).limit(1);
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await db.delete(authSessions).where(eq(authSessions.id, session.id));
    return null;
  }
  return session;
}

export async function deleteSessionByTokenHash(tokenHash: string) {
  const db = getDb();
  if (!db) return;
  await ensureSchema();
  await db.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash));
}

export async function cleanupExpiredAuthRows() {
  const db = getDb();
  if (!db) return;
  await ensureSchema();
  await db.delete(authMagicLinks).where(lt(authMagicLinks.expiresAt, new Date()));
  await db.delete(authSessions).where(lt(authSessions.expiresAt, new Date()));
}

export async function getLatestPlan(userId: string) {
  const db = getDb();
  if (!db) return null;
  await ensureSchema();
  const [row] = await db.select().from(preparednessPlans).where(eq(preparednessPlans.userId, userId)).orderBy(desc(preparednessPlans.createdAt)).limit(1);
  return row ?? null;
}

export async function savePreparednessPlan(userId: string, input: PreparednessInput, weather: WeatherContext, plan: PreparednessPlan, source: string) {
  const db = getDb();
  if (!db) return;
  await ensureSchema();
  
  let [profile] = await db.select().from(citizenProfiles).where(eq(citizenProfiles.userId, userId)).limit(1);
  if (profile) {
    await db.update(citizenProfiles).set({ city: input.city, pincode: input.pincode, landmark: input.landmark, language: input.language, household: input.household }).where(eq(citizenProfiles.id, profile.id));
  } else {
    [profile] = await db.insert(citizenProfiles).values({ userId, city: input.city, pincode: input.pincode, landmark: input.landmark, language: input.language, household: input.household }).returning();
  }

  await db.insert(preparednessPlans).values({
    userId,
    profileId: profile.id,
    source,
    riskLevel: weather.floodRisk,
    input,
    weatherContext: weather,
    plan,
  });
}

export async function getAlerts(city: string) {
  const redis = getRedis();
  const cacheKey = `alerts:${city.toLowerCase()}`;
  if (redis) {
    const cached = await redis.get<typeof alertsSeed>(cacheKey);
    if (cached) return cached;
  }

  const db = getDb();
  if (!db) return alertsSeed.filter((item) => item.city.toLowerCase() === city.toLowerCase()).slice(0, 3);
  await ensureSchema();
  const rows = await db.select().from(weatherAlerts).where(eq(weatherAlerts.city, city)).orderBy(desc(weatherAlerts.createdAt)).limit(5);
  const result = rows.length ? rows : alertsSeed.filter((item) => item.city.toLowerCase() === city.toLowerCase()).slice(0, 3);
  if (redis) await redis.set(cacheKey, result, { ex: 60 * 10 });
  return result;
}

export async function getChecklist(city: string, userId: string) {
  const db = getDb();
  if (!db) return checklistSeed.filter((item) => item.city.toLowerCase() === city.toLowerCase());
  await ensureSchema();
  
  const rows = await db.select().from(checklistProgress).where(and(eq(checklistProgress.city, city), eq(checklistProgress.userId, userId)));
  if (rows.length) return rows;

  const citySeed = checklistSeed.filter((item) => item.city.toLowerCase() === city.toLowerCase());
  if (citySeed.length) {
    const values = citySeed.map((item) => ({
      userId,
      city: item.city,
      category: item.category,
      itemKey: item.itemKey,
      label: item.label,
      done: item.done,
      priority: item.priority,
    }));
    return await db.insert(checklistProgress).values(values).returning();
  }
  return [];
}

export async function toggleChecklistItem(city: string, itemKey: string, userId: string) {
  const db = getDb();
  if (!db) return;
  await ensureSchema();
  const [row] = await db.select().from(checklistProgress).where(and(eq(checklistProgress.city, city), eq(checklistProgress.itemKey, itemKey), eq(checklistProgress.userId, userId))).limit(1);
  if (!row) {
    await getChecklist(city, userId);
    const [row2] = await db.select().from(checklistProgress).where(and(eq(checklistProgress.city, city), eq(checklistProgress.itemKey, itemKey), eq(checklistProgress.userId, userId))).limit(1);
    if (row2) {
      await db.update(checklistProgress).set({ done: !row2.done }).where(eq(checklistProgress.id, row2.id));
    }
    return;
  }
  await db.update(checklistProgress).set({ done: !row.done }).where(eq(checklistProgress.id, row.id));
}

export async function getResources(city: string) {
  const db = getDb();
  if (!db) return resourcesSeed.filter((item) => item.city.toLowerCase() === city.toLowerCase());
  await ensureSchema();
  const rows = await db.select().from(localResources).where(eq(localResources.city, city));
  return rows.length ? rows : resourcesSeed.filter((item) => item.city.toLowerCase() === city.toLowerCase());
}

export async function saveTravelAdvisory(city: string, route: string, mode: string, result: TravelAdvisory, source: string) {
  const db = getDb();
  if (!db) return;
  await ensureSchema();
  await db.insert(travelAdvisories).values({ city, route, mode, source, result });
}

export async function getLatestTravelAdvisory() {
  const db = getDb();
  if (!db) return null;
  await ensureSchema();
  const [row] = await db.select().from(travelAdvisories).orderBy(desc(travelAdvisories.createdAt)).limit(1);
  return row ?? null;
}

export async function saveAssistantMessage(userId: string, sessionId: string, prompt: string, response: string, language: string, source: string) {
  const db = getDb();
  if (!db) return;
  await ensureSchema();
  await db.insert(assistantMessages).values({ userId, sessionId, prompt, response, language, source });
}

export async function getAssistantMessages(userId: string, sessionId: string) {
  const db = getDb();
  if (!db) return [];
  await ensureSchema();
  return db.select().from(assistantMessages).where(and(eq(assistantMessages.userId, userId), eq(assistantMessages.sessionId, sessionId))).orderBy(desc(assistantMessages.createdAt)).limit(8);
}
