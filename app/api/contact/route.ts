import { uploadBuffer } from "@/lib/cloudinary";
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

  if (!name.trim() || !email.trim()) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  let attachmentUrl: string | undefined;
  if (attachment && attachment.size > 0) {
    const ext = extOf(attachment.name);
    if (!ALLOWED_EXT.has(ext)) {
      return Response.json({ error: "File type not allowed" }, { status: 415 });
    }
    if (attachment.size > MAX_SIZE) {
      return Response.json({ error: "File too large (max 10 MB)" }, { status: 413 });
    }
    const bytes = await attachment.arrayBuffer();
    attachmentUrl = await uploadBuffer(Buffer.from(bytes), "grey-arch/inquiries");
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

  return Response.json({ ok: true }, { status: 201 });
}
