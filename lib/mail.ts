import nodemailer from "nodemailer";

/**
 * Transactional e-mails for the contact form and job applications.
 *
 * Sent via SMTP (no IMAP) from no-reply@grayarc.de. Each submission produces:
 *   1. a confirmation to the visitor, in the language they used on the site
 *   2. a notification to the office inbox (michael@grayarc.de) with
 *      Reply-To = visitor, so "reply" goes straight to them, and the uploaded
 *      file attached.
 *
 * Templates (kept separate on purpose):
 *   contactConfirmation  de | en
 *   applicationConfirmation de | en
 *   contactNotification  de | en
 *   applicationNotification de | en
 *
 * Config via env; only SMTP_PASSWORD is required, the rest has defaults.
 */

export type MailLocale = "de" | "en";
export type Salutation = "mr" | "ms" | "";

const CAT_GIF_URL =
  process.env.MAIL_CAT_GIF_URL ??
  "https://pub-564792c364284f1480aa91cf5b945431.r2.dev/images/grey-arch/email/cat-slide-orange.gif";
const CAT_CID = "grayarc-cat-slide-orange";
const SITE_URL = "https://grayarc.de";

function cfg() {
  const clean = (v: string | undefined) => (v ?? "").replace(/^\uFEFF/, "").trim();
  return {
    host: clean(process.env.SMTP_HOST) || "mx981f.netcup.net",
    port: Number(clean(process.env.SMTP_PORT) || 465),
    user: clean(process.env.SMTP_USER) || "no-reply@grayarc.de",
    pass: clean(process.env.SMTP_PASSWORD),
    from: clean(process.env.MAIL_FROM) || "GrayArc <no-reply@grayarc.de>",
    notifyTo: clean(process.env.MAIL_NOTIFY_TO) || "michael@grayarc.de",
  };
}

export function mailConfigured(): boolean {
  return !!cfg().pass;
}

let transporter: nodemailer.Transporter | null = null;
function getTransport() {
  if (transporter) return transporter;
  const c = cfg();
  transporter = nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.port === 465,
    auth: { user: c.user, pass: c.pass },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

let catGif: Buffer | null = null;
async function getCatGif(): Promise<Buffer | null> {
  if (catGif) return catGif;
  try {
    const res = await fetch(CAT_GIF_URL);
    if (!res.ok) return null;
    catGif = Buffer.from(await res.arrayBuffer());
    return catGif;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const nl2br = (s: string) => esc(s).replace(/\r?\n/g, "<br>");

export function normalizeSalutation(v: unknown): Salutation {
  return v === "mr" || v === "ms" ? v : "";
}

export function normalizeLocale(v: unknown): MailLocale {
  return v === "en" ? "en" : "de";
}

/** "Herr Mustermann" / "Mr Mustermann" / full name if no salutation given. */
export function addressName(name: string, salutation: Salutation, locale: MailLocale): string {
  const clean = name.trim().replace(/\s+/g, " ");
  if (!salutation) return clean;
  const last = clean.split(" ").pop() || clean;
  const title =
    locale === "de" ? (salutation === "mr" ? "Herr" : "Frau") : salutation === "mr" ? "Mr" : "Ms";
  return `${title} ${last}`;
}

/** Same as addressName but keeps the full name (for the internal subject line). */
function titledFullName(name: string, salutation: Salutation, locale: MailLocale): string {
  const clean = name.trim().replace(/\s+/g, " ");
  if (!salutation) return clean;
  const title =
    locale === "de" ? (salutation === "mr" ? "Herr" : "Frau") : salutation === "mr" ? "Mr" : "Ms";
  return `${title} ${clean}`;
}

function layout(opts: { locale: MailLocale; preheader: string; bodyHtml: string; withCat: boolean }): string {
  // Internal notifications (no cat) are meant to be replied to — no "do not reply" footer there.
  const footer = !opts.withCat
    ? opts.locale === "de"
      ? "Automatische Benachrichtigung von grayarc.de."
      : "Automatic notification from grayarc.de."
    : opts.locale === "de"
      ? `Diese E-Mail wurde automatisch versendet – bitte antworten Sie nicht darauf.<br>Bei Fragen erreichen Sie uns unter <a href="mailto:michael@grayarc.de" style="color:#1a1a1a;">michael@grayarc.de</a>.`
      : `This e-mail was sent automatically – please do not reply to it.<br>If you have any questions, contact us at <a href="mailto:michael@grayarc.de" style="color:#1a1a1a;">michael@grayarc.de</a>.`;
  const cat = opts.withCat
    ? `<tr><td style="padding:8px 40px 0 40px;" align="center">
         <img src="cid:${CAT_CID}" width="186" height="320" alt="${
           opts.locale === "de" ? "Orangefarbene Katze rutscht auf dem Rücken eine Rutsche hinunter" : "Orange cat sliding down a slide on its back"
         }" style="display:block;border:0;max-width:100%;height:auto;">
       </td></tr>`
    : "";
  return `<!doctype html>
<html lang="${opts.locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GrayArc</title></head>
<body style="margin:0;padding:0;background:#ffffff;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
  <tr><td align="center" style="padding:24px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:1px solid #e6e0d6;background:#ffffff;">
      <tr><td style="padding:28px 40px 20px 40px;border-bottom:1px solid #e6e0d6;font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:2px;color:#1a1a1a;">
        GRAYARC<span style="display:block;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:#6f6657;margin-top:4px;">${
          opts.locale === "de" ? "Ingenieurbüro · Planung · Tragwerksplanung · Bauwesen" : "Engineering office · Planning · Structural design · Construction"
        }</span>
      </td></tr>
      ${cat}
      <tr><td style="padding:24px 40px 8px 40px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">
        ${opts.bodyHtml}
      </td></tr>
      <tr><td style="padding:16px 40px 28px 40px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6f6657;border-top:1px solid #e6e0d6;">
        ${footer}<br><br>GrayArc · Berlin · <a href="${SITE_URL}" style="color:#6f6657;">grayarc.de</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function summaryTable(rows: [string, string | undefined][]): string {
  const r = rows
    .filter(([, v]) => v && v.trim())
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#6f6657;white-space:nowrap;font-size:13px;">${esc(
          k
        )}</td><td style="padding:6px 0;font-size:13px;color:#1a1a1a;">${nl2br(v!)}</td></tr>`
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 16px 0;border-top:1px solid #e6e0d6;width:100%;">${r}</table>`;
}

function summaryText(rows: [string, string | undefined][]): string {
  return rows
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export interface ContactData {
  locale: MailLocale;
  salutation: Salutation;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  attachmentName?: string;
}

export interface ApplicationData extends ContactData {
  jobTitle: string;
}

type Mail = { subject: string; html: string; text: string; withCat: boolean };

/** Template 1/2 — contact confirmation to the visitor. */
export function contactConfirmation(d: ContactData): Mail {
  const who = addressName(d.name, d.salutation, d.locale);
  if (d.locale === "en") {
    const rows: [string, string | undefined][] = [
      ["Name", d.name], ["E-mail", d.email], ["Phone", d.phone], ["Message", d.message], ["Attachment", d.attachmentName],
    ];
    return {
      withCat: true,
      subject: "Your inquiry just slid into our inbox 🐾",
      text: `Hello ${who},\n\nyour inquiry just slid into our inbox – as relaxed as the orange cat in this e-mail, sliding down its slide on its back. Unlike the cat, your message didn't end up on the floor at the bottom, it landed safely on our desk.\n\nWe will personally get back to you within two business days.\n\nYour message:\n${summaryText(rows)}\n\nBest regards\nThe GrayArc team\n\nThis e-mail was sent automatically – please do not reply.`,
      html: layout({
        locale: "en", withCat: true, preheader: "We received your inquiry – and it landed safely.",
        bodyHtml: `<p style="margin:0 0 16px 0;">Hello ${esc(who)},</p>
          <p style="margin:0 0 16px 0;">your inquiry just <strong>slid into our inbox</strong> – as relaxed as the orange cat above, sliding down its slide on its back. 🐾</p>
          <p style="margin:0 0 16px 0;">Good news: unlike the cat, your message didn't end up on the floor at the bottom. It landed safely on our desk, and we will personally get back to you within <strong>two business days</strong>.</p>
          <p style="margin:0 0 4px 0;font-size:13px;color:#6f6657;">Your message at a glance:</p>
          ${summaryTable(rows)}
          <p style="margin:0 0 16px 0;">Best regards<br>The GrayArc team</p>`,
      }),
    };
  }
  const rows: [string, string | undefined][] = [
    ["Name", d.name], ["E-Mail", d.email], ["Telefon", d.phone], ["Nachricht", d.message], ["Anhang", d.attachmentName],
  ];
  return {
    withCat: true,
    subject: "Ihre Anfrage ist bei uns reingeslidet 🐾",
    text: `Hallo ${who},\n\nIhre Anfrage ist soeben in unser Postfach geslidet – so entspannt wie die orangefarbene Katze in dieser E-Mail, die auf dem Rücken ihre Rutsche hinuntersaust. Anders als die Katze ist Ihre Nachricht aber nicht unten auf dem Boden gelandet, sondern sicher auf unserem Schreibtisch.\n\nWir melden uns innerhalb von zwei Werktagen persönlich bei Ihnen.\n\nIhre Angaben:\n${summaryText(rows)}\n\nViele Grüße\nIhr GrayArc-Team\n\nDiese E-Mail wurde automatisch versendet – bitte nicht darauf antworten.`,
    html: layout({
      locale: "de", withCat: true, preheader: "Ihre Anfrage ist sicher bei uns gelandet.",
      bodyHtml: `<p style="margin:0 0 16px 0;">Hallo ${esc(who)},</p>
        <p style="margin:0 0 16px 0;">Ihre Anfrage ist soeben <strong>in unser Postfach geslidet</strong> – so entspannt wie die orangefarbene Katze oben, die auf dem Rücken ihre Rutsche hinuntersaust. 🐾</p>
        <p style="margin:0 0 16px 0;">Die gute Nachricht: Anders als die Katze ist Ihre Nachricht nicht unten auf dem Boden gelandet, sondern sicher auf unserem Schreibtisch. Wir melden uns innerhalb von <strong>zwei Werktagen</strong> persönlich bei Ihnen.</p>
        <p style="margin:0 0 4px 0;font-size:13px;color:#6f6657;">Ihre Angaben im Überblick:</p>
        ${summaryTable(rows)}
        <p style="margin:0 0 16px 0;">Viele Grüße<br>Ihr GrayArc-Team</p>`,
    }),
  };
}

/** Template 3/4 — application confirmation to the applicant. */
export function applicationConfirmation(d: ApplicationData): Mail {
  const who = addressName(d.name, d.salutation, d.locale);
  if (d.locale === "en") {
    const rows: [string, string | undefined][] = [
      ["Position", d.jobTitle], ["Name", d.name], ["E-mail", d.email], ["Phone", d.phone], ["Message", d.message], ["Resume", d.attachmentName],
    ];
    return {
      withCat: true,
      subject: `Your application slid in – ${d.jobTitle} 🐾`,
      text: `Hello ${who},\n\nyour application for "${d.jobTitle}" just slid into our inbox – with even more style than the orange cat in this e-mail on its slide. And unlike the cat, it didn't end up on the floor – it landed safely with us.\n\nWe will review your documents carefully and get back to you personally as soon as possible.\n\nYour application:\n${summaryText(rows)}\n\nBest regards\nThe GrayArc team\n\nThis e-mail was sent automatically – please do not reply.`,
      html: layout({
        locale: "en", withCat: true, preheader: `We received your application for ${d.jobTitle}.`,
        bodyHtml: `<p style="margin:0 0 16px 0;">Hello ${esc(who)},</p>
          <p style="margin:0 0 16px 0;">your application for <strong>${esc(d.jobTitle)}</strong> just <strong>slid into our inbox</strong> – with even more style than the orange cat above on its slide. 🐾</p>
          <p style="margin:0 0 16px 0;">And unlike the cat, it didn't end up on the floor – it landed safely with us. We will review your documents carefully and get back to you personally as soon as possible.</p>
          <p style="margin:0 0 4px 0;font-size:13px;color:#6f6657;">Your application at a glance:</p>
          ${summaryTable(rows)}
          <p style="margin:0 0 16px 0;">Thank you for your interest in GrayArc – we look forward to getting to know you.</p>
          <p style="margin:0 0 16px 0;">Best regards<br>The GrayArc team</p>`,
      }),
    };
  }
  const rows: [string, string | undefined][] = [
    ["Stelle", d.jobTitle], ["Name", d.name], ["E-Mail", d.email], ["Telefon", d.phone], ["Nachricht", d.message], ["Lebenslauf", d.attachmentName],
  ];
  return {
    withCat: true,
    subject: `Ihre Bewerbung ist reingeslidet – ${d.jobTitle} 🐾`,
    text: `Hallo ${who},\n\nIhre Bewerbung als „${d.jobTitle}“ ist soeben in unser Postfach geslidet – mit noch mehr Stil als die orangefarbene Katze in dieser E-Mail auf ihrer Rutsche. Und anders als die Katze ist sie nicht auf dem Boden, sondern sicher bei uns gelandet.\n\nWir sehen uns Ihre Unterlagen sorgfältig an und melden uns so schnell wie möglich persönlich bei Ihnen.\n\nIhre Bewerbung:\n${summaryText(rows)}\n\nViele Grüße\nIhr GrayArc-Team\n\nDiese E-Mail wurde automatisch versendet – bitte nicht darauf antworten.`,
    html: layout({
      locale: "de", withCat: true, preheader: `Ihre Bewerbung als ${d.jobTitle} ist bei uns angekommen.`,
      bodyHtml: `<p style="margin:0 0 16px 0;">Hallo ${esc(who)},</p>
        <p style="margin:0 0 16px 0;">Ihre Bewerbung als <strong>${esc(d.jobTitle)}</strong> ist soeben <strong>in unser Postfach geslidet</strong> – mit noch mehr Stil als die orangefarbene Katze oben auf ihrer Rutsche. 🐾</p>
        <p style="margin:0 0 16px 0;">Und anders als die Katze ist sie nicht auf dem Boden, sondern sicher bei uns gelandet. Wir sehen uns Ihre Unterlagen sorgfältig an und melden uns so schnell wie möglich persönlich bei Ihnen.</p>
        <p style="margin:0 0 4px 0;font-size:13px;color:#6f6657;">Ihre Bewerbung im Überblick:</p>
        ${summaryTable(rows)}
        <p style="margin:0 0 16px 0;">Danke für Ihr Interesse an GrayArc – wir freuen uns darauf, Sie kennenzulernen.</p>
        <p style="margin:0 0 16px 0;">Viele Grüße<br>Ihr GrayArc-Team</p>`,
    }),
  };
}

/** Template 5/6 — new contact inquiry, to the office inbox. */
export function contactNotification(d: ContactData): Mail {
  const who = titledFullName(d.name, d.salutation, d.locale);
  if (d.locale === "en") {
    const rows: [string, string | undefined][] = [
      ["Name", who], ["E-mail", d.email], ["Phone", d.phone], ["Site language", "English"], ["Message", d.message], ["Attachment", d.attachmentName ? `${d.attachmentName} (attached)` : undefined],
    ];
    return {
      withCat: false,
      subject: `New inquiry from ${who} regarding contact`,
      text: `New contact inquiry via grayarc.de\n\n${summaryText(rows)}\n\nReply directly to this e-mail to answer ${d.name}.`,
      html: layout({
        locale: "en", withCat: false, preheader: `New inquiry from ${who}`,
        bodyHtml: `<p style="margin:0 0 12px 0;font-size:17px;"><strong>New contact inquiry</strong> via grayarc.de</p>
          ${summaryTable(rows)}
          <p style="margin:0 0 16px 0;font-size:13px;color:#6f6657;">Simply reply to this e-mail – your answer goes directly to ${esc(d.email)}.</p>`,
      }),
    };
  }
  const rows: [string, string | undefined][] = [
    ["Name", who], ["E-Mail", d.email], ["Telefon", d.phone], ["Sprache der Website", "Deutsch"], ["Nachricht", d.message], ["Anhang", d.attachmentName ? `${d.attachmentName} (angehängt)` : undefined],
  ];
  return {
    withCat: false,
    subject: `Neue Anfrage von ${who} bezüglich Kontakt`,
    text: `Neue Kontaktanfrage über grayarc.de\n\n${summaryText(rows)}\n\nEinfach auf diese E-Mail antworten, um ${d.name} zu antworten.`,
    html: layout({
      locale: "de", withCat: false, preheader: `Neue Anfrage von ${who}`,
      bodyHtml: `<p style="margin:0 0 12px 0;font-size:17px;"><strong>Neue Kontaktanfrage</strong> über grayarc.de</p>
        ${summaryTable(rows)}
        <p style="margin:0 0 16px 0;font-size:13px;color:#6f6657;">Einfach auf diese E-Mail antworten – die Antwort geht direkt an ${esc(d.email)}.</p>`,
    }),
  };
}

/** Template 7/8 — new application received, to the office inbox. */
export function applicationNotification(d: ApplicationData): Mail {
  const who = titledFullName(d.name, d.salutation, d.locale);
  if (d.locale === "en") {
    const rows: [string, string | undefined][] = [
      ["Position", d.jobTitle], ["Name", who], ["E-mail", d.email], ["Phone", d.phone], ["Site language", "English"], ["Message", d.message], ["Resume", d.attachmentName ? `${d.attachmentName} (attached)` : "none uploaded"],
    ];
    return {
      withCat: false,
      subject: `New inquiry from ${who} regarding application – ${d.jobTitle}`,
      text: `New application via grayarc.de\n\n${summaryText(rows)}\n\nReply directly to this e-mail to answer ${d.name}.`,
      html: layout({
        locale: "en", withCat: false, preheader: `New application from ${who}`,
        bodyHtml: `<p style="margin:0 0 12px 0;font-size:17px;"><strong>New application</strong> for ${esc(d.jobTitle)}</p>
          ${summaryTable(rows)}
          <p style="margin:0 0 16px 0;font-size:13px;color:#6f6657;">The application is also stored in the admin area under "Applications". Reply to this e-mail to answer ${esc(d.email)} directly.</p>`,
      }),
    };
  }
  const rows: [string, string | undefined][] = [
    ["Stelle", d.jobTitle], ["Name", who], ["E-Mail", d.email], ["Telefon", d.phone], ["Sprache der Website", "Deutsch"], ["Nachricht", d.message], ["Lebenslauf", d.attachmentName ? `${d.attachmentName} (angehängt)` : "keiner hochgeladen"],
  ];
  return {
    withCat: false,
    subject: `Neue Anfrage von ${who} bezüglich Bewerbung – ${d.jobTitle}`,
    text: `Neue Bewerbung über grayarc.de\n\n${summaryText(rows)}\n\nEinfach auf diese E-Mail antworten, um ${d.name} zu antworten.`,
    html: layout({
      locale: "de", withCat: false, preheader: `Neue Bewerbung von ${who}`,
      bodyHtml: `<p style="margin:0 0 12px 0;font-size:17px;"><strong>Neue Bewerbung</strong> als ${esc(d.jobTitle)}</p>
        ${summaryTable(rows)}
        <p style="margin:0 0 16px 0;font-size:13px;color:#6f6657;">Die Bewerbung ist zusätzlich im Admin-Bereich unter „Bewerbungen“ gespeichert. Einfach auf diese E-Mail antworten – die Antwort geht direkt an ${esc(d.email)}.</p>`,
    }),
  };
}

// ---------------------------------------------------------------------------
// Sending
// ---------------------------------------------------------------------------

export interface FileAttachment {
  filename: string;
  content: Buffer;
  contentType?: string;
}

async function send(to: string, mail: Mail, extra: { replyTo?: string; attachments?: FileAttachment[] } = {}) {
  const c = cfg();
  const attachments: nodemailer.SendMailOptions["attachments"] = [...(extra.attachments ?? [])];
  if (mail.withCat) {
    const gif = await getCatGif();
    if (gif) attachments.push({ filename: "cat-slide-orange.gif", content: gif, contentType: "image/gif", cid: CAT_CID });
  }
  await getTransport().sendMail({
    from: c.from,
    to,
    replyTo: extra.replyTo,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    attachments,
  });
}

/** Sends confirmation + office notification. Never throws (logs instead). */
export async function sendContactMails(d: ContactData, file?: FileAttachment) {
  if (!mailConfigured()) {
    console.warn("[mail] SMTP_PASSWORD not set – contact e-mails skipped");
    return;
  }
  const c = cfg();
  const results = await Promise.allSettled([
    send(d.email, contactConfirmation(d)),
    send(c.notifyTo, contactNotification(d), { replyTo: d.email, attachments: file ? [file] : [] }),
  ]);
  results.forEach((r) => r.status === "rejected" && console.error("[mail] contact mail failed:", r.reason));
}

export async function sendApplicationMails(d: ApplicationData, file?: FileAttachment) {
  if (!mailConfigured()) {
    console.warn("[mail] SMTP_PASSWORD not set – application e-mails skipped");
    return;
  }
  const c = cfg();
  const results = await Promise.allSettled([
    send(d.email, applicationConfirmation(d)),
    send(c.notifyTo, applicationNotification(d), { replyTo: d.email, attachments: file ? [file] : [] }),
  ]);
  results.forEach((r) => r.status === "rejected" && console.error("[mail] application mail failed:", r.reason));
}

/** For local test sends only. */
export async function sendRaw(to: string, mail: Mail) {
  await send(to, mail);
}
