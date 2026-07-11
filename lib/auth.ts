import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { getSessionByTokenHash, getUserById } from "./repository";

export const SESSION_COOKIE_NAME = "session_token";

export function createOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function buildMagicLink(origin: string, token: string): string {
  const url = new URL("/auth/verify", origin);
  url.searchParams.set("token", token);
  return url.toString();
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const session = await getSessionByTokenHash(hashToken(sessionToken));
  if (!session) return null;

  const user = await getUserById(session.userId);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
  };
}
