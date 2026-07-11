import fs from 'node:fs';
import path from 'node:path';

const credentialsPath = path.resolve(
  process.cwd(),
  'client_secret_2_193116445097-76cn1unoirvjj7l7s1h37p8ih405hu27.apps.googleusercontent.com.json',
);

const raw = fs.readFileSync(credentialsPath, 'utf8');
const parsed = JSON.parse(raw) as {
  web: {
    client_id: string;
    client_secret: string;
    auth_uri: string;
    token_uri: string;
    redirect_uris: string[];
  };
};

const client = parsed.web;
const redirectUri = client.redirect_uris[0];
const scopes = ['https://www.googleapis.com/auth/gmail.send'];

const authUrl = new URL(client.auth_uri);
authUrl.searchParams.set('client_id', client.client_id);
authUrl.searchParams.set('redirect_uri', redirectUri);
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', scopes.join(' '));
authUrl.searchParams.set('access_type', 'offline');
authUrl.searchParams.set('prompt', 'consent');

authUrl.searchParams.set('include_granted_scopes', 'true');

console.log('\nGoogle OAuth refresh-token helper\n');
console.log('1. Start the app with: pnpm dev');
console.log(`2. Open this URL in your browser:\n\n${authUrl.toString()}\n`);
console.log(`3. After consent, Google will redirect to:\n   ${redirectUri}`);
console.log('4. Copy the `code` value shown on the callback page or from the URL.');
console.log('5. Exchange it with this command:');
console.log(`\nnode --env-file=.env --import tsx scripts/google-refresh-token-exchange.ts "PASTE_CODE_HERE"\n`);
console.log('6. Add the printed GMAIL_REFRESH_TOKEN line to .env and set GMAIL_FROM to the approved Gmail address.');
