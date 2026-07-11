import { describe, expect, it } from 'vitest';
import nextConfig, { securityHeaders } from './next.config';

describe('next config security defaults', () => {
  it('disables the x-powered-by header', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });

  it('registers baseline security headers for every route', async () => {
    const headers = await nextConfig.headers?.();

    expect(headers).toEqual([
      {
        source: '/:path*',
        headers: [...securityHeaders],
      },
    ]);
  });

  it('includes clickjacking, mime sniffing, referrer, permissions, and hsts protections', () => {
    expect(securityHeaders).toEqual(
      expect.arrayContaining([
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ]),
    );
  });
});
