import { NextResponse } from "next/server";
import { contactNotification, sendRaw, mailConfigured } from "@/lib/mail";

// TEMPORARY one-off self-test (removed right after use): one office notification,
// clearly marked as a test, to the corrected office address.
const TOKEN = "dc0c0309b27afad9d0d6465f1dc339aa";
const TO = "michel@grayarc.de";

export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("t") !== TOKEN) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!mailConfigured()) return NextResponse.json({ ok: false, error: "SMTP not configured" });
  try {
    const mail = contactNotification({ locale: "de", salutation: "mr", name: "TEST – Max Mustermann", email: "mohammaddibo3535@gmail.com", phone: "+49 30 123456", message: "TEST: Dies ist eine Test-Benachrichtigung der Website grayarc.de. Bitte ignorieren." });
    await sendRaw(TO, { ...mail, subject: "[TEST] " + mail.subject });
    return NextResponse.json({ ok: true, sent: 1, to: TO });
  } catch (e) {
    const err = e as { code?: string; responseCode?: number; response?: string; message?: string };
    return NextResponse.json({ ok: false, code: err.code, responseCode: err.responseCode, response: (err.response ?? err.message ?? "").slice(0, 160) });
  }
}
