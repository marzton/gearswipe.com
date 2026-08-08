import type { MailRoute } from "./mail-routing";

type SendEmailBinding = {
  send(input: {
    to: string | string[];
    from: { email: string; name?: string };
    subject: string;
    text: string;
    html: string;
    replyTo?: string;
    headers?: Record<string, string>;
  }): Promise<unknown>;
};

type EmailEnv = {
  EMAIL?: SendEmailBinding;
};

declare global {
  // Shared edge runtime binding injected by worker/index.ts
  var __GEARSWIPE_ENV__:
    | ({ DB?: D1Database; EMAIL?: SendEmailBinding } & Record<string, unknown>)
    | undefined;
}

function getEmailEnv(): EmailEnv {
  return (globalThis.__GEARSWIPE_ENV__ ?? {}) as EmailEnv;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendMailRouteNotification(input: {
  route: MailRoute;
  subject: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  formType: string;
}) {
  const emailEnv = getEmailEnv();
  if (!emailEnv.EMAIL) return { sent: false as const };

  const from = { email: input.route.from, name: `${input.route.workspace} routing` };
  const to = input.route.to.length > 1 ? input.route.to : input.route.to[0];
  const companyLine = input.company ? `<li>Company: ${escapeHtml(input.company)}</li>` : "";

  await emailEnv.EMAIL.send({
    to,
    from,
    subject: `${input.route.subjectPrefix} ${input.subject}`,
    replyTo: input.email,
    text: [
      `${input.route.workspace} ${input.formType} submission`,
      `Name: ${input.name}`,
      `Email: ${input.email}`,
      input.company ? `Company: ${input.company}` : "",
      "",
      input.message,
      "",
      `Route: ${input.route.alias} → ${input.route.to.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <h2 style="margin:0 0 12px">${escapeHtml(input.route.workspace)} ${escapeHtml(input.formType)} submission</h2>
        <p style="margin:0 0 12px;color:#444">Routed from <strong>${escapeHtml(input.route.alias)}</strong> to <strong>${escapeHtml(input.route.to.join(", "))}</strong>.</p>
        <ul style="margin:0 0 16px;padding-left:18px">
          <li>Name: ${escapeHtml(input.name)}</li>
          <li>Email: ${escapeHtml(input.email)}</li>
          ${companyLine}
          <li>Subject: ${escapeHtml(input.subject)}</li>
        </ul>
        <div style="white-space:pre-wrap;border-left:4px solid #111;padding-left:12px">${escapeHtml(input.message)}</div>
      </div>
    `,
  });

  return { sent: true as const };
}

export async function sendAutoReply(input: {
  to: string;
  from: string;
  subject: string;
  workspace: string;
  body: string;
}) {
  const emailEnv = getEmailEnv();
  if (!emailEnv.EMAIL) return { sent: false as const };

  await emailEnv.EMAIL.send({
    to: input.to,
    from: { email: input.from, name: `${input.workspace} support` },
    subject: input.subject,
    text: input.body,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;white-space:pre-wrap">${escapeHtml(input.body)}</div>`,
  });

  return { sent: true as const };
}
