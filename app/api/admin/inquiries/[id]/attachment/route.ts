import { getInquiries } from "@/lib/data-manager";
import { isPrivateRef, privateRefExt, readPrivateFile } from "@/lib/private-storage";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

// Access is restricted to logged-in admins by proxy.ts (/api/admin/*).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const inquiries = await getInquiries();
  const inquiry = inquiries.find((i) => i.id === id);
  if (!inquiry?.attachmentUrl) {
    return new Response("Not found", { status: 404 });
  }
  if (!isPrivateRef(inquiry.attachmentUrl)) {
    // Files from the former Bunny.net storage are no longer reachable.
    return new Response(
      "Diese Datei lag beim alten Speicher (Bunny.net) und ist nicht mehr abrufbar.",
      { status: 410, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  try {
    const file = await readPrivateFile(inquiry.attachmentUrl);
    if (!file) return new Response("Not found", { status: 404 });
    const ext = privateRefExt(inquiry.attachmentUrl);
    return new Response(file.body, {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? file.contentType ?? "application/octet-stream",
        "Content-Disposition": `inline; filename="${inquiry.name.replace(/[^\w.-]/g, "_")}-attachment.${ext || "bin"}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[attachment] read failed:", err);
    return new Response("Failed to fetch attachment", { status: 500 });
  }
}
