import { NextRequest, NextResponse } from "next/server";
import { createAuthSession, consumeMagicLink } from "@/lib/repository";
import { createOpaqueToken, hashToken, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?auth=missing", request.url));
  }

  const link = await consumeMagicLink(hashToken(token));
  if (!link) {
    return NextResponse.redirect(new URL("/login?auth=invalid", request.url));
  }

  const sessionToken = createOpaqueToken();
  const expiresAt = await createAuthSession(link.userId, hashToken(sessionToken));
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
  response.cookies.delete("session");

  return response;
}
