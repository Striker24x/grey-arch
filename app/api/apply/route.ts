import { uploadBuffer } from "@/lib/cloudinary";
import { getApplications, saveApplications, getJobs } from "@/lib/data-manager";
import type { JobApplication } from "@/lib/data-manager";

const ALLOWED_EXT = new Set([".pdf", ".doc", ".docx"]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extOf(filename: string) {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return Response.json({ error: "Invalid form data" }, { status: 400 });

  const jobId = (formData.get("jobId") as string) || "";
  const name = (formData.get("name") as string) || "";
  const email = (formData.get("email") as string) || "";
  const phone = (formData.get("phone") as string) || "";
  const message = (formData.get("message") as string) || "";
  const resume = formData.get("resume") as File | null;

  if (!jobId || !name.trim() || !email.trim()) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return Response.json({ error: "Invalid email" }, { status: 400 });
  }

  const jobs = await getJobs();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return Response.json({ error: "Job not found" }, { status: 404 });

  let resumeUrl: string | undefined;
  if (resume && resume.size > 0) {
    const ext = extOf(resume.name);
    if (!ALLOWED_EXT.has(ext)) {
      return Response.json({ error: "File type not allowed" }, { status: 415 });
    }
    if (resume.size > MAX_SIZE) {
      return Response.json({ error: "File too large (max 10 MB)" }, { status: 413 });
    }
    const bytes = await resume.arrayBuffer();
    resumeUrl = await uploadBuffer(Buffer.from(bytes), "grey-arch/applications");
  }

  const application: JobApplication = {
    id: `application-${Date.now()}`,
    jobId,
    jobTitle: job.translations.en.title,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    message: message.trim(),
    resumeUrl,
    submittedAt: new Date().toISOString(),
    status: "new",
  };

  const applications = await getApplications();
  applications.push(application);
  await saveApplications(applications);

  return Response.json({ ok: true }, { status: 201 });
}
