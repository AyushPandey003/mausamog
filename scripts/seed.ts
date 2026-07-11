import alerts from "@/data/seed/alerts.json";
import checklist from "@/data/seed/checklist.json";
import resources from "@/data/seed/resources.json";
import { getDb } from "@/lib/db";
import { ensureSchema } from "@/lib/repository";
import { appUsers, authMagicLinks, authSessions, checklistProgress, localResources, weatherAlerts } from "@/lib/schema";

async function main() {
  const db = getDb();
  if (!db) throw new Error("DATABASE_URL is missing.");
  await ensureSchema();

  await db.delete(authSessions);
  await db.delete(authMagicLinks);
  await db.delete(weatherAlerts);
  await db.delete(localResources);
  await db.delete(checklistProgress);
  await db.delete(appUsers);

  await db.insert(appUsers).values({
    fullName: "Ayush",
    email: "citizen@mausamog.gov",
  });

  await db.insert(weatherAlerts).values(alerts.map((item) => ({ ...item, cachedUntil: null })));
  await db.insert(localResources).values(
    resources.map((item) => ({
      ...item,
      meta: Object.fromEntries(Object.entries(item.meta).filter(([, value]) => typeof value === 'string')),
    })),
  );
  await db.insert(checklistProgress).values(checklist);

  console.log(`Seeded 1 user, ${alerts.length} alerts, ${resources.length} local resources, and ${checklist.length} checklist items.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
