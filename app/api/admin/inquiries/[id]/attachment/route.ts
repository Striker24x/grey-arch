import { cloudinary } from "@/lib/cloudinary";
import { getInquiries } from "@/lib/data-manager";

const CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/** Parses a Cloudinary delivery URL into its resource type + public id. */
function parseCloudinaryUrl(url: string): { resourceType: string; publicId: string; format: string } | null {
  const m = url.match(/\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+)\.([a-zA-Z0-9]+)$/);
  if (!m) return null;
  return { resourceType: m[1], publicId: m[2], format: m[3] };
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

  const parsed = parseCloudinaryUrl(inquiry.attachmentUrl);
  if (!parsed) {
    return new Response("Invalid attachment URL", { status: 500 });
  }

  try {
    // Our Cloudinary account restricts unsigned delivery of PDF/raw files, so we
    // generate a signed, authenticated download URL and stream the bytes back
    // through our own origin instead of hotlinking Cloudinary directly.
    const signedUrl = cloudinary.utils.private_download_url(parsed.publicId, parsed.format, {
      resource_type: parsed.resourceType,
      type: "upload",
    });

    const upstream = await fetch(signedUrl);
    if (!upstream.ok || !upstream.body) {
      return new Response("Failed to fetch attachment", { status: 502 });
    }

    const contentType = CONTENT_TYPES[parsed.format.toLowerCase()] ?? "application/octet-stream";
    return new Response(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${inquiry.name.replace(/[^\w.-]/g, "_")}-attachment.${parsed.format}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Failed to fetch attachment", { status: 500 });
  }
}
