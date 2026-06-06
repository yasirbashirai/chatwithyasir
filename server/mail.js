// Email alerts for chatwithyasir — Nodemailer over Gmail SMTP.
//
// When a visitor opens a chat, Yasir gets an instant email with a one-click
// link to jump in. Uses a Google App Password (not the account password).
//
// Required env:
//   SMTP_USER     the Gmail address that sends (e.g. yasirbashirai@gmail.com)
//   SMTP_PASS     a 16-char Google App Password (Account → Security → App passwords)
//   NOTIFY_EMAIL  where alerts are delivered (defaults to SMTP_USER)
//   ADMIN_URL     base URL of the deployed site (for the deep link)

import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || SMTP_USER;
const ADMIN_URL = (process.env.ADMIN_URL || "https://chatwith.yasirbashir.com").replace(/\/$/, "");

export const mailConfigured = !!(SMTP_USER && SMTP_PASS);

// Gmail's well-known SMTP service. Created lazily so the server still boots if
// email isn't configured.
const transporter = mailConfigured
  ? nodemailer.createTransport({ service: "gmail", auth: { user: SMTP_USER, pass: SMTP_PASS } })
  : null;

/**
 * Alert Yasir that a new visitor just opened a chat. Best-effort: never throws
 * (a failed email must not break conversation creation).
 */
export async function notifyNewConversation({ name, email, conversationId }) {
  if (!transporter) {
    console.warn("⚠ Email not configured (SMTP_USER/SMTP_PASS) — skipping alert.");
    return;
  }
  const joinLink = `${ADMIN_URL}/?admin=yasir#c=${conversationId}`;
  try {
    await transporter.sendMail({
      from: `"Chat with Yasir" <${SMTP_USER}>`,
      to: NOTIFY_EMAIL,
      subject: `💬 New chat: ${name || "A visitor"} just opened your site`,
      text: [
        `${name || "A visitor"} (${email || "no email"}) just started a chat on your site.`,
        ``,
        `Jump in live: ${joinLink}`,
        ``,
        `If you don't join, they'll keep chatting with the AI assistant.`,
      ].join("\n"),
      html: `
        <div style="font-family:-apple-system,Segoe UI,Inter,sans-serif;color:#0F2E27">
          <h2 style="margin:0 0 8px">💬 New chat just opened</h2>
          <p style="margin:0 0 4px"><b>${escapeHtml(name || "A visitor")}</b></p>
          <p style="margin:0 0 16px"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email || "no email")}</a></p>
          <a href="${joinLink}"
             style="display:inline-block;background:#288672;color:#fff;text-decoration:none;
                    padding:12px 20px;border-radius:12px;font-weight:700">
            Join the chat live →
          </a>
          <p style="margin:16px 0 0;color:#0F2E2799;font-size:13px">
            If you don't join, they'll keep chatting with the AI assistant.
          </p>
        </div>`,
    });
  } catch (e) {
    console.error("Email alert failed:", e?.message || e);
  }
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
