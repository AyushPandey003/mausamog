import { boolean, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export type HouseholdInput = {
  adults: number;
  children: number;
  elderly: number;
  pets: number;
  housingType: string;
  floodProne: boolean;
  needs: string[];
};

export type PreparednessInput = {
  city: string;
  pincode: string;
  landmark: string;
  language: string;
  household: HouseholdInput;
  travelMode: string;
  travelRoute: string;
};

export type WeatherContext = {
  city: string;
  rainfallLevel: string;
  floodRisk: string;
  alertHeadline: string;
  updatedAt: string;
};

export type PreparednessPlan = {
  riskSummary: string;
  beforeMonsoon: string[];
  duringHeavyRain: string[];
  afterFlooding: string[];
  emergencyKit: string[];
  familySpecificAdvice: string[];
  travelAdvice: string[];
  localAuthorityMessage: string;
  doNotDo: string[];
  language: string;
};

export type TravelAdvisory = {
  riskRating: "low" | "moderate" | "high";
  summary: string;
  saferTiming: string;
  carryItems: string[];
  avoidIf: string[];
};

export type PeerAlertType = "landslide" | "road_block" | "waterlogging" | "tree_fall" | "power_line" | "other";

export type PeerAlertReportInput = {
  city: string;
  type: PeerAlertType;
  severity: "low" | "moderate" | "high";
  description: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
};

export type PeerAlertReport = PeerAlertReportInput & {
  id: string;
  reporterId: string;
  createdAt: string;
  source: "peer";
};

export const appUsers = pgTable("app_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  email: varchar("email", { length: 120 }).notNull().unique(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authMagicLinks = pgTable("auth_magic_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => appUsers.id),
  tokenHash: text("token_hash").notNull().unique(),
  intent: varchar("intent", { length: 24 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const authSessions = pgTable("auth_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => appUsers.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const citizenProfiles = pgTable("citizen_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => appUsers.id),
  city: varchar("city", { length: 80 }).notNull(),
  pincode: varchar("pincode", { length: 12 }).notNull(),
  landmark: text("landmark").notNull(),
  language: varchar("language", { length: 24 }).notNull(),
  household: jsonb("household").$type<HouseholdInput>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const preparednessPlans = pgTable("preparedness_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id"),
  userId: uuid("user_id").references(() => appUsers.id),
  source: varchar("source", { length: 24 }).notNull().default("gemini"),
  riskLevel: varchar("risk_level", { length: 24 }).notNull(),
  input: jsonb("input").$type<PreparednessInput>().notNull(),
  weatherContext: jsonb("weather_context").$type<WeatherContext>().notNull(),
  plan: jsonb("plan").$type<PreparednessPlan>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const checklistProgress = pgTable("checklist_progress", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => appUsers.id),
  city: varchar("city", { length: 80 }).notNull(),
  category: varchar("category", { length: 40 }).notNull(),
  itemKey: varchar("item_key", { length: 80 }).notNull(),
  label: text("label").notNull(),
  done: boolean("done").notNull().default(false),
  priority: varchar("priority", { length: 24 }).notNull().default("medium"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const weatherAlerts = pgTable("weather_alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  city: varchar("city", { length: 80 }).notNull(),
  severity: varchar("severity", { length: 24 }).notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  source: varchar("source", { length: 24 }).notNull().default("seeded"),
  cachedUntil: timestamp("cached_until", { withTimezone: true }),
  meta: jsonb("meta").$type<Record<string, string>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const travelAdvisories = pgTable("travel_advisories", {
  id: uuid("id").defaultRandom().primaryKey(),
  city: varchar("city", { length: 80 }).notNull(),
  route: text("route").notNull(),
  mode: varchar("mode", { length: 24 }).notNull(),
  source: varchar("source", { length: 24 }).notNull().default("gemini"),
  result: jsonb("result").$type<TravelAdvisory>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const assistantMessages = pgTable("assistant_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: varchar("session_id", { length: 120 }).notNull(),
  userId: uuid("user_id").references(() => appUsers.id),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  language: varchar("language", { length: 24 }).notNull(),
  source: varchar("source", { length: 24 }).notNull().default("gemini"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const localResources = pgTable("local_resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  city: varchar("city", { length: 80 }).notNull(),
  name: text("name").notNull(),
  kind: varchar("kind", { length: 32 }).notNull(),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  openStatus: varchar("open_status", { length: 32 }).notNull(),
  meta: jsonb("meta").$type<Record<string, string>>().notNull().default({}),
});
