import { describe, expect, it } from 'vitest';
import { buildMagicLink, createOpaqueToken, hashToken } from './auth';

describe('auth helper logic', () => {
  it('creates opaque tokens that can be safely hashed for storage', () => {
    const token = createOpaqueToken();
    const hash = hashToken(token);

    expect(token).toHaveLength(43);
    expect(hash).toHaveLength(64);
    expect(hash).not.toBe(token);
    expect(hashToken(token)).toBe(hash);
  });

  it('builds a one-time magic link', () => {
    const link = buildMagicLink('http://localhost:3000', 'test-token');

    expect(link).toBe('http://localhost:3000/auth/verify?token=test-token');
  });
});
