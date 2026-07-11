export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const safeCode = escapeHtml(code ?? '');
  const safeError = escapeHtml(error ?? '');

  const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Google OAuth Callback</title>
      <style>
        body { font-family: Arial, Helvetica, sans-serif; background: #f7f9fb; color: #191c1e; padding: 32px; }
        .card { max-width: 760px; margin: 40px auto; background: white; border: 1px solid #c6c6cd; border-radius: 24px; padding: 24px; box-shadow: 0 8px 24px rgba(15,23,42,0.06); }
        code, textarea { width: 100%; display: block; background: #f2f4f6; border: 1px solid #c6c6cd; border-radius: 12px; padding: 12px; font-family: monospace; word-break: break-all; }
        textarea { min-height: 140px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Google OAuth Callback</h1>
        ${error ? `<p><strong>Error:</strong> ${safeError}</p>` : ''}
        ${code ? `<p>Copy this authorization code and run the exchange script:</p><textarea readonly>${safeCode}</textarea>` : '<p>No authorization code found.</p>'}
        <p style="margin-top: 16px;">Command:</p>
        <code>$env:GMAIL_AUTH_CODE="PASTE_CODE_HERE"; pnpm gmail:exchange</code>
      </div>
    </body>
  </html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
