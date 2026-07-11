import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { config, proxy } from './proxy';

describe('proxy auth gate', () => {
  it('redirects anonymous users away from protected routes', () => {
    const response = proxy(new NextRequest('https://mausamog.app/assistant'));

    expect(response.headers.get('location')).toBe('https://mausamog.app/login');
  });

  it('redirects authenticated users away from auth pages', () => {
    const request = new NextRequest('https://mausamog.app/login', {
      headers: {
        cookie: 'session_token=active-session',
      },
    });

    const response = proxy(request);

    expect(response.headers.get('location')).toBe('https://mausamog.app/');
  });

  it('allows anonymous access to public auth routes', () => {
    const response = proxy(new NextRequest('https://mausamog.app/register'));

    expect(response.headers.get('location')).toBeNull();
  });

  it('excludes metadata routes from proxy auth checks', () => {
    expect(config.matcher).toEqual([
      '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
    ]);
  });
});
