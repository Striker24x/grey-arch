import { cloudinary } from "@/lib/cloudinary";
import { getApplications } from "@/lib/data-manager";

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
  const applications = await getApplications();
  const application = applications.find((a) => a.id === id);
  if (!application?.resumeUrl) {
    return new Response("Not found", { status: 404 });
  }

  const parsed = parseCloudinaryUrl(application.resumeUrl);
  if (!parsed) {
    return new Response("Invalid resume URL", { status: 500 });
  }

  try {
    // Our Cloudinary account restricts unsigned delivery of PDF/raw files, so we
    // generate a signed, authenticated download URL (proven by API secret) and
    // stream the bytes back through our own origin instead of hotlinking Cloudinary.
    const signedUrl = cloudinary.utils.private_download_url(parsed.publicId, parsed.format, {
      resource_type: parsed.resourceType,
      type: "upload",
    });

    const upstream = await fetch(signedUrl);
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
