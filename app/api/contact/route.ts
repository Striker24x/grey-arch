import { after } from "next/server";
import { uploadPrivateFile } from "@/lib/private-storage";
import { normalizeLocale, normalizeSalutation, sendContactMails, type FileAttachment } from "@/lib/mail";
import { getInquiries, saveInquiries } from "@/lib/data-manager";
import type { ContactInquiry } from "@/lib/data-manager";

const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extOf(filename: string) {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return Response.json({ error: "Invalid form data" }, { status: 400 });

  const name = (formData.get("name") as string) || "";
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const message = (formData.get("message") as string) || "";
  const attachment = formData.get("attachment") as File | null;
  const locale = normalizeLocale(formData.get("locale"));
  const salutation = normalizeSalutation(formData.get("salutation"));

  if (!name.trim() || !email.trim()) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  let attachmentUrl: string | undefined;
  let mailFile: FileAttachment | undefined;
  if (attachment && attachment.size > 0) {
    const ext = extOf(attachment.name);
    if (!ALLOWED_EXT.has(ext)) {
      return Response.json({ error: "File type not allowed" }, { status: 415 });
    }
    if (attachment.size > MAX_SIZE) {
      return Response.json({ error: "File too large (max 10 MB)" }, { status: 413 });
    }
    try {
      const buffer = Buffer.from(await attachment.arrayBuffer());
      attachmentUrl = await uploadPrivateFile("inquiries", attachment.name, buffer, attachment.type);
      mailFile = { filename: attachment.name, content: buffer, contentType: attachment.type || undefined };
    } catch (err) {
      console.error("[contact] attachment upload failed:", err);
      return Response.json({ error: "Upload failed" }, { status: 502 });
    }
  }

  const inquiry: ContactInquiry = {
    id: `inquiry-${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    message: message.trim(),
    attachmentUrl,
    submittedAt: new Date().toISOString(),
    status: "new",
  };

  const inquiries = await getInquiries();
  inquiries.push(inquiry);
  await saveInquiries(inquiries);

  // Confirmation to the visitor + notification to the office, after the response.
  after(() =>
    sendContactMails(
      {
        locale,
        salutation,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        message: inquiry.message,
        attachmentName: mailFile?.filename,
      },
      mailFile
    )
  );

  return Response.json({ ok: true }, { status: 201 });
}
