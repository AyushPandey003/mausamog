import { afterEach, describe, expect, it } from 'vitest';
import { getGmailConfigStatus, getGmailConsentUrl, sendMagicLinkEmail } from './email';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('email helpers', () => {
  it('detects incomplete gmail configuration', () => {
    delete process.env.GMAIL_CLIENT_ID;
    delete process.env.GMAIL_CLIENT_SECRET;
    delete process.env.GMAIL_REDIRECT_URI;
    delete process.env.GMAIL_REFRESH_TOKEN;
    process.env.GMAIL_FROM = 'MausamOG <ayushpandey.job@gmail.com>';

    const status = getGmailConfigStatus();

    expect(status.ready).toBe(false);
    expect(status.hasClientConfig).toBe(false);
    expect(status.hasRefreshToken).toBe(false);
    expect(status.hasSender).toBe(true);
  });

  it('builds a gmail consent URL when client config exists', () => {
    process.env.GMAIL_CLIENT_ID = 'client-id';
    process.env.GMAIL_CLIENT_SECRET = 'client-secret';
    process.env.GMAIL_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google';

    const url = getGmailConsentUrl();

    expect(url).toContain('access_type=offline');
    expect(url).toContain('prompt=consent');
    expect(url).toContain(encodeURIComponent('https://www.googleapis.com/auth/gmail.send'));
  });

  it('returns not_configured without attempting to send email', async () => {
    delete process.env.GMAIL_CLIENT_ID;
    delete process.env.GMAIL_CLIENT_SECRET;
    delete process.env.GMAIL_REDIRECT_URI;
    delete process.env.GMAIL_REFRESH_TOKEN;
    process.env.GMAIL_FROM = 'MausamOG <ayushpandey.job@gmail.com>';

    const result = await sendMagicLinkEmail({
      to: 'recipient@example.com',
      fullName: 'Ayush',
      magicLink: 'http://localhost:3000/auth/verify?token=test',
      intent: 'login',
    });

    expect(result).toEqual({ sent: false, reason: 'not_configured' });
  });
});
