# Google Refresh Token Helper

This repo now includes a quick helper flow for your Google OAuth client.

## Files

- `scripts/google-refresh-token.ts`
- `scripts/google-refresh-token-exchange.ts`
- `app/api/auth/callback/google/route.ts`

## Step 1
Run the app:

```bash
pnpm dev
```

## Step 2
Print the authorization URL:

```bash
node --import tsx scripts/google-refresh-token.ts
```

Open the printed URL in your browser and approve access.

## Step 3
After Google redirects back to:

```text
http://localhost:3000/api/auth/callback/google
```

copy the authorization code shown on the page.

## Step 4
Exchange the code for tokens:

```bash
node --env-file=.env --import tsx scripts/google-refresh-token-exchange.ts "PASTE_CODE_HERE"
```

If Google returns a refresh token, the script will print:

```text
REFRESH_TOKEN=...
```

## Notes

- The helper requests `openid email profile` scopes.
- It includes `access_type=offline` and `prompt=consent` so Google can return a refresh token.
- If no refresh token is returned, revoke the app from your Google account and retry the flow.
