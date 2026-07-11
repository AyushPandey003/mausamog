import fs from 'node:fs';
import path from 'node:path';

const code = process.argv[2];
if (!code) {
  console.error('Usage: node --env-file=.env --import tsx scripts/google-refresh-token-exchange.ts "CODE"');
  process.exit(1);
}

const credentialsPath = path.resolve(
  process.cwd(),
  'client_secret_2_193116445097-76cn1unoirvjj7l7s1h37p8ih405hu27.apps.googleusercontent.com.json',
);

const raw = fs.readFileSync(credentialsPath, 'utf8');
const parsed = JSON.parse(raw) as {
  web: {
    client_id: string;
    client_secret: string;
    token_uri: string;
    redirect_uris: string[];
  };
};

const client = parsed.web;
const redirectUri = client.redirect_uris[0];

async function main() {
  const response = await fetch(client.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: client.client_id,
      client_secret: client.client_secret,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Token exchange failed:');
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log('\nToken response:\n');
  console.log(JSON.stringify(data, null, 2));

  if (data.refresh_token) {
    console.log(`\nGMAIL_REFRESH_TOKEN="${data.refresh_token}"\n`);
  } else {
    console.log('\nNo refresh token returned. Try again with prompt=consent and ensure this is the first consent or revoke app access before retrying.\n');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
