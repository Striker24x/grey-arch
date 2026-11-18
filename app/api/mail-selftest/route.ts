import { NextResponse } from "next/server";
import { contactConfirmation, applicationConfirmation, sendRaw, mailConfigured } from "@/lib/mail";

// TEMPORARY one-off SMTP self-test (removed right after use). Sends only the two
// visitor-confirmation templates to a fixed address — no notification to the office.
const TOKEN = "c640717790dc78d86329a657d3450d2e";
const TO = "mohammaddibo3535@gmail.com";

export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("t") !== TOKEN) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!mailConfigured()) return NextResponse.json({ ok: false, error: "SMTP not configured" });
  const base = { locale: "de" as const, salutation: "mr" as const, name: "Max Mustermann", email: TO, phone: "+49 30 123456" };
  try {
    await sendRaw(TO, contactConfirmation({ ...base, message: "Testanfrage über das Kontaktformular.", attachmentName: "grundriss.pdf" }));
    await sendRaw(TO, applicationConfirmation({ ...base, message: "Testbewerbung.", attachmentName: "lebenslauf.pdf", jobTitle: "Werkstudent" }));
    return NextResponse.json({ ok: true, sent: 2 });
  } catch (e) {
    const err = e as { code?: string; responseCode?: number; response?: string; message?: string };
    return NextResponse.json({ ok: false, code: err.code, responseCode: err.responseCode, response: (err.response ?? err.message ?? "").slice(0, 160) });
  }
}
