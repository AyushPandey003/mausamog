import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createAuthSessionMock: vi.fn(),
  consumeMagicLinkMock: vi.fn(),
  createOpaqueTokenMock: vi.fn(),
  hashTokenMock: vi.fn(),
}));

vi.mock('@/lib/repository', () => ({
  createAuthSession: mocks.createAuthSessionMock,
  consumeMagicLink: mocks.consumeMagicLinkMock,
}));

vi.mock('@/lib/auth', () => ({
  SESSION_COOKIE_NAME: 'session_token',
  createOpaqueToken: mocks.createOpaqueTokenMock,
  hashToken: mocks.hashTokenMock,
}));

import { NextRequest } from 'next/server';
import { GET } from './route';

describe('auth verify route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when the token is missing', async () => {
    const response = await GET(new NextRequest('https://mausamog.app/auth/verify'));

    expect(response.headers.get('location')).toBe('https://mausamog.app/login?auth=missing');
    expect(mocks.consumeMagicLinkMock).not.toHaveBeenCalled();
  });

  it('redirects to login when the token is invalid', async () => {
    mocks.hashTokenMock.mockReturnValue('hashed-token');
    mocks.consumeMagicLinkMock.mockResolvedValue(null);

    const response = await GET(new NextRequest('https://mausamog.app/auth/verify?token=bad-token'));

    expect(mocks.consumeMagicLinkMock).toHaveBeenCalledWith('hashed-token');
    expect(response.headers.get('location')).toBe('https://mausamog.app/login?auth=invalid');
  });

  it('creates a hardened session cookie for a valid magic link', async () => {
    mocks.hashTokenMock.mockImplementation((value: string) => `hash:${value}`);
    mocks.consumeMagicLinkMock.mockResolvedValue({ userId: 'user-1' });
    mocks.createOpaqueTokenMock.mockReturnValue('fresh-session-token');
    mocks.createAuthSessionMock.mockResolvedValue(new Date('2026-07-12T00:00:00.000Z'));

    const response = await GET(new NextRequest('https://mausamog.app/auth/verify?token=valid-token'));
    const setCookie = response.headers.get('set-cookie') ?? '';

    expect(mocks.createAuthSessionMock).toHaveBeenCalledWith('user-1', 'hash:fresh-session-token');
    expect(response.headers.get('location')).toBe('https://mausamog.app/');
    expect(setCookie).toContain('session_token=fresh-session-token');
    expect(setCookie).toContain('Path=/');
    expect(setCookie).toContain('HttpOnly');
    expect(setCookie).toContain('SameSite=lax');
    expect(setCookie).toContain('Expires=Sun, 12 Jul 2026 00:00:00 GMT');
  });
});
