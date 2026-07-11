import { google } from "googleapis";

type MagicLinkEmailInput = {
  to: string;
  fullName: string;
  magicLink: string;
  intent: "login" | "signup";
};

type EmailResult =
  | { sent: true }
  | { sent: false; reason: "not_configured" | "send_failed"; error?: string };

const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.send";

export function getGmailConfigStatus() {
  const from = process.env.GMAIL_FROM?.trim() ?? "";
  const hasSender = from.includes("@") && !from.includes("your-gmail-address");
  const required = [
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI,
    process.env.GMAIL_REFRESH_TOKEN,
  ];

  return {
    ready: required.every(Boolean) && hasSender,
    hasClientConfig: Boolean(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET),
    hasRefreshToken: Boolean(process.env.GMAIL_REFRESH_TOKEN),
    hasSender,
  };
}

export async function sendMagicLinkEmail(input: MagicLinkEmailInput): Promise<EmailResult> {
  const status = getGmailConfigStatus();
  if (!status.ready) return { sent: false, reason: "not_configured" };

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI,
    );
    oauth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const subject = input.intent === "signup" ? "Finish your MausamOG signup" : "Your MausamOG sign-in link";
    const intro =
      input.intent === "signup"
        ? "Use this secure one-time link to finish creating your MausamOG safety profile."
        : "Use this secure one-time link to sign in to your MausamOG command center.";

    await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodeEmail({
          from: process.env.GMAIL_FROM!,
          to: input.to,
          subject,
          text: [
            `Hi ${input.fullName},`,
            "",
            intro,
            "",
            input.magicLink,
            "",
            "This link expires in 15 minutes and can be used once.",
          ].join("\n"),
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#102027">
              <h1 style="font-size:20px;margin:0 0 12px">MausamOG</h1>
              <p>Hi ${escapeHtml(input.fullName)},</p>
              <p>${escapeHtml(intro)}</p>
              <p>
                <a href="${escapeHtml(input.magicLink)}" style="display:inline-block;background:#0f766e;color:white;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">
                  Open magic link
                </a>
              </p>
              <p style="font-size:13px;color:#52616b">This link expires in 15 minutes and can be used once.</p>
            </div>
          `,
        }),
      },
    });

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: "send_failed",
      error: error instanceof Error ? error.message : "Unknown Gmail send error",
    };
  }
}

export function getGmailConsentUrl() {
  if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REDIRECT_URI) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI,
  );

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [GMAIL_SCOPE],
  });
}

function encodeEmail(input: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const boundary = `mausamog-${Date.now()}`;
  const message = [
    `From: ${input.from}`,
    `To: ${input.to}`,
    `Subject: ${encodeHeader(input.subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    input.text,
    "",
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    input.html,
    "",
    `--${boundary}--`,
  ].join("\r\n");

  return Buffer.from(message).toString("base64url");
}

function encodeHeader(value: string) {
  return `=?UTF-8?B?${Buffer.from(value).toString("base64")}?=`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
