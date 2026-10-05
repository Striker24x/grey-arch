import { fetchPrivateStorageFile } from "@/lib/bunny";
import { getApplications } from "@/lib/data-manager";

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

  try {
    // Bunny Storage files at storage.bunnycdn.com require the AccessKey header
    // to read, so they're private by default — we fetch server-side and stream
    // the bytes back through our own (admin-authenticated) origin.
    const upstream = await fetchPrivateStorageFile(application.resumeUrl);
    if (!upstream.ok || !upstream.body) {
      return new Response("Failed to fetch resume", { status: 502 });
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${application.name.replace(/[^\w.-]/g, "_")}-cv.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Failed to fetch resume", { status: 500 });
  }
}
