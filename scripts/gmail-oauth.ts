import { google } from "googleapis";

const mode = process.argv[2] ?? "url";
const scope = "https://www.googleapis.com/auth/gmail.send";

function getClient() {
  const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI } = process.env;
  if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || !GMAIL_REDIRECT_URI) {
    throw new Error("GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REDIRECT_URI must be set in .env.");
  }
  return new google.auth.OAuth2(GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URI);
}

async function main() {
  const client = getClient();

  if (mode === "exchange") {
    const code = process.env.GMAIL_AUTH_CODE;
    if (!code) throw new Error("Set GMAIL_AUTH_CODE before running the exchange command.");
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error("Google did not return a refresh token. Re-run the auth URL with prompt=consent or revoke the app grant first.");
    }
    console.log(`GMAIL_REFRESH_TOKEN="${tokens.refresh_token}"`);
    return;
  }

  console.log(
    client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [scope],
    }),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
