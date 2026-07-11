import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  getSessionByTokenHashMock: vi.fn(),
  getUserByIdMock: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: mocks.cookiesMock,
}));

vi.mock('./repository', () => ({
  getSessionByTokenHash: mocks.getSessionByTokenHashMock,
  getUserById: mocks.getUserByIdMock,
}));

import { getSessionUser, hashToken, SESSION_COOKIE_NAME } from './auth';

describe('getSessionUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when no session cookie exists', async () => {
    mocks.cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) });

    await expect(getSessionUser()).resolves.toBeNull();
  });

  it('returns null when the session record is missing', async () => {
    mocks.cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: 'token-123' }) });
    mocks.getSessionByTokenHashMock.mockResolvedValue(null);

    await expect(getSessionUser()).resolves.toBeNull();
    expect(mocks.getSessionByTokenHashMock).toHaveBeenCalledWith(hashToken('token-123'));
  });

  it('returns the mapped user when session and user exist', async () => {
    mocks.cookiesMock.mockResolvedValue({ get: vi.fn().mockReturnValue({ value: 'token-123' }) });
    mocks.getSessionByTokenHashMock.mockResolvedValue({ userId: 'user-1' });
    mocks.getUserByIdMock.mockResolvedValue({ id: 'user-1', email: 'citizen@mausamog.gov', fullName: 'Citizen User' });

    await expect(getSessionUser()).resolves.toEqual({
      id: 'user-1',
      email: 'citizen@mausamog.gov',
      fullName: 'Citizen User',
    });
    expect(mocks.cookiesMock).toHaveBeenCalled();
    expect(mocks.getUserByIdMock).toHaveBeenCalledWith('user-1');
    expect(SESSION_COOKIE_NAME).toBe('session_token');
  });
});
