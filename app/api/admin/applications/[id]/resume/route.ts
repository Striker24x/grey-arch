import { getApplications } from "@/lib/data-manager";
import { isPrivateRef, privateRefExt, readPrivateFile } from "@/lib/private-storage";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Access is restricted to logged-in admins by proxy.ts (/api/admin/*).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const applications = await getApplications();
  const application = applications.find((a) => a.id === id);
  if (!application?.resumeUrl) {
    return new Response("Not found", { status: 404 });
  }
  if (!isPrivateRef(application.resumeUrl)) {
    // Files from the former Bunny.net storage are no longer reachable.
    return new Response(
      "Diese Datei lag beim alten Speicher (Bunny.net) und ist nicht mehr abrufbar.",
      { status: 410, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  try {
    const file = await readPrivateFile(application.resumeUrl);
    if (!file) return new Response("Not found", { status: 404 });
    const ext = privateRefExt(application.resumeUrl);
    return new Response(file.body, {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? file.contentType ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${application.name.replace(/[^\w.-]/g, "_")}-cv.${ext || "pdf"}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[resume] read failed:", err);
    return new Response("Failed to fetch resume", { status: 500 });
  }
}
