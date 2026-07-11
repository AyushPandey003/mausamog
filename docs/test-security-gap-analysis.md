# Testing + Security Gap Analysis

Date: 2026-07-11

## Baseline from the evaluation screenshot

- Overall AI score: **93.53 / 100**
- Code Quality: **86**
- Security: **98**
- Testing: **94**
- Efficiency: **100**
- Accessibility: **96**
- Problem Statement Alignment: **94**

## What I improved

### Security hardening

Updated `next.config.ts` to add baseline HTTP security headers for all routes:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `poweredByHeader: false`

### Proxy hardening

Updated `proxy.ts` matcher so auth proxy checks do **not** intercept metadata routes:

- `robots.txt`
- `sitemap.xml`

This follows the current Next.js proxy guidance and avoids accidental auth blocking for crawler-facing metadata.

### New tests added

1. `app/auth/verify/route.test.ts`
   - missing token redirect
   - invalid token redirect
   - valid token sets hardened session cookie

2. `proxy.test.ts`
   - anonymous redirect from protected routes
   - authenticated redirect away from auth pages
   - anonymous access to public auth routes
   - matcher excludes metadata paths

3. `next.config.test.ts`
   - validates `poweredByHeader: false`
   - validates security headers are registered globally
   - validates presence of key security protections

## Current test status

`pnpm test` passes:

- **10 test files passed**
- **46 tests passed**

## Folder-by-folder comparison

### Test density snapshot

| Folder | Source files | Test files | Status |
| --- | ---: | ---: | --- |
| `lib/` | 10 | 6 | Good coverage for core logic |
| `app/` | 5 | 1 | Partial coverage |
| `app/auth/verify/` | 1 | 1 | Covered |
| `tests/e2e/` | 0 | 1 | Basic smoke only |
| `app/components/` | 7 | 0 | Lagging |
| `app/login/` | 2 | 0 | Lagging |
| `app/register/` | 2 | 0 | Lagging |
| `app/alerts/` | 1 | 0 | Lagging |
| `app/assistant/` | 1 | 0 | Lagging |
| `app/checklist/` | 1 | 0 | Lagging |
| `app/resources/` | 1 | 0 | Lagging |
| `app/travel/` | 1 | 0 | Lagging |
| `app/api/auth/callback/google/` | 1 | 0 | Security-sensitive gap |
| `scripts/` | 4 | 0 | Low priority unless shipped to production flows |

## Where we are lagging most

### 1. `app/components/`
Biggest testing gap.

Files without direct tests:

- `app/components/action-status-message.tsx`
- `app/components/alerts-experience.tsx`
- `app/components/alerts-map.tsx`
- `app/components/assistant-form.tsx`
- `app/components/header.tsx`
- `app/components/plan-form.tsx`
- `app/components/travel-form.tsx`

Why this matters:

- most user-facing workflows live here
- form validation UX is not directly asserted
- rendering and empty/error states are untested

### 2. Route pages under `app/`
Pages currently rely mostly on indirect action tests.

High-value missing page tests:

- `app/page.tsx`
- `app/alerts/page.tsx`
- `app/assistant/page.tsx`
- `app/checklist/page.tsx`
- `app/resources/page.tsx`
- `app/travel/page.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`

Why this matters:

- page-level rendering regressions can slip through
- route protection, hydration, and SSR assumptions are only lightly checked

### 3. Security-sensitive auth integration
Still lagging despite the new improvements:

- `app/api/auth/callback/google/route.ts` has no tests
- `lib/repository.ts` auth/session persistence paths are untested
- no direct test for expired session cleanup behavior in repository layer

Why this matters:

- auth callback failures are high impact
- token/session lifecycle is security-sensitive
- email + OAuth flows often regress under env/config edge cases

### 4. E2E coverage
Only one smoke spec exists:

- `tests/e2e/auth-smoke.spec.ts`

What is missing:

- full login magic-link path
- logout flow
- generate preparedness plan flow
- assistant rate-limit UX
- peer alert submission flow
- travel advisory generation flow

## Security posture after changes

### Strong now

- opaque auth tokens are hashed before persistence
- session cookie is `httpOnly`
- session cookie uses `sameSite=lax`
- session cookie uses `secure` in production
- assistant and peer alerts are rate-limited
- global security headers now exist
- proxy no longer catches `robots.txt` / `sitemap.xml`

### Still missing / recommended next

1. Add tests for `app/api/auth/callback/google/route.ts`
2. Add repository tests for:
   - `consumeMagicLink()`
   - `getSessionByTokenHash()` expiry cleanup
   - `cleanupExpiredAuthRows()`
3. Consider a stricter CSP once Mapbox, Gmail, and any external domains are fully enumerated
4. Add E2E assertions for redirect loops, cookie persistence, and logout
5. Add negative tests for malformed OAuth callback parameters

## Recommended next priority order

### Priority 1
- test `app/api/auth/callback/google/route.ts`
- add E2E for login, logout, and magic-link verification
- add tests for `app/components/plan-form.tsx`, `assistant-form.tsx`, `travel-form.tsx`

### Priority 2
- test page rendering for `app/page.tsx`, `app/alerts/page.tsx`, `app/travel/page.tsx`
- add repository auth/session lifecycle tests

### Priority 3
- test metadata routes `app/robots.ts` and `app/sitemap.ts`
- test scripts only if they are part of deployment automation

## Expected impact on scoring

Most likely score gains would come from:

- **Testing**: stronger auth-route, proxy, page, and form coverage
- **Code Quality**: clearer configuration guarantees plus better regression safety
- **Security**: stronger default response headers and better auth flow test depth

## Files changed

- `next.config.ts`
- `proxy.ts`
- `next.config.test.ts`
- `proxy.test.ts`
- `app/auth/verify/route.test.ts`
