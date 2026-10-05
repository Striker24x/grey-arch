import { fetchPrivateStorageFile } from "@/lib/bunny";
import { getInquiries } from "@/lib/data-manager";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

function extOf(url: string): string {
  const m = url.match(/\.([a-zA-Z0-9]+)$/);
  return m ? m[1].toLowerCase() : "";
}

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

  try {
    // Bunny Storage files at storage.bunnycdn.com require the AccessKey header
    // to read, so they're private by default — we fetch server-side and stream
    // the bytes back through our own (admin-authenticated) origin.
    const upstream = await fetchPrivateStorageFile(inquiry.attachmentUrl);
    if (!upstream.ok || !upstream.body) {
      return new Response("Failed to fetch attachment", { status: 502 });
    }

    const format = extOf(inquiry.attachmentUrl);
    const contentType = CONTENT_TYPES[format] ?? "application/octet-stream";
    return new Response(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${inquiry.name.replace(/[^\w.-]/g, "_")}-attachment.${format}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Failed to fetch attachment", { status: 500 });
  }
}
